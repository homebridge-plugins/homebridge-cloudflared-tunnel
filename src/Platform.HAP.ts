/* Copyright(C) 2023-2024, donavanbecker (https://github.com/donavanbecker). All rights reserved.
 *
 * Platform.HAP.ts: @homebridge-plugins/homebridge-cloudflared-tunnel.
 */
import type { API, DynamicPlatformPlugin, HAP, Logging, PlatformAccessory } from 'homebridge'
import type { TunnelOptions } from 'untun'

import type { CloudflaredTunnelPlatformConfig } from './settings.js'

import { readFileSync } from 'node:fs'

import { startTunnel } from 'untun'

import { CloudflaredTunnel } from './cloudflared-tunnel.js'
import { redactConfig } from './redact.js'
import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js'

/**
 * HomebridgePlatform
 * This class is the main constructor for your plugin, this is where you should
 * parse the user config and discover/register accessories with Homebridge.
 */
export class CloudflaredTunnelPlatform implements DynamicPlatformPlugin {
  public accessories: PlatformAccessory[]
  public readonly api: API
  public readonly log: Logging
  protected readonly hap: HAP
  public config!: CloudflaredTunnelPlatformConfig
  protected readonly tunnelAccessoryName = 'Cloudflared Tunnel Status'
  protected readonly tunnelAccessoryUUID: string
  protected tunnelAccessory: PlatformAccessory | undefined
  protected tunnelRunning = false

  // The running cloudflared child, kept so it can be stopped on shutdown
  protected tunnel: CloudflaredTunnel | undefined

  platformConfig!: CloudflaredTunnelPlatformConfig
  platformLogging!: CloudflaredTunnelPlatformConfig['logging']
  platformRefreshRate: CloudflaredTunnelPlatformConfig['refreshRate']
  platformUpdateRate: CloudflaredTunnelPlatformConfig['updateRate']
  platformPushRate: CloudflaredTunnelPlatformConfig['pushRate']
  version!: string

  constructor(
    log: Logging,
    config: CloudflaredTunnelPlatformConfig,
    api: API,
  ) {
    this.accessories = []
    this.api = api
    this.hap = this.api.hap
    this.log = log
    this.tunnelAccessoryUUID = this.hap.uuid.generate('cloudflared-tunnel-status')
    // only load if configured
    if (!config) {
      return
    }

    // Plugin options into our config variables.
    this.config = {
      platform: 'CloudflaredTunnel',
      name: config.name,
      domain: config.domain as string,
      token: config.token as string,
      url: config.url as string,
      port: config.port as number,
      hostname: config.hostname as string,
      protocol: config.protocol as 'http' | 'https' | undefined,
      verifyTLS: config.verifyTLS as boolean,
      logging: config.logging as string,
      refreshRate: config.refreshRate as number,
      updateRate: config.updateRate as number,
      pushRate: config.pushRate as number,
      acceptCloudflareNotice: config.acceptCloudflareNotice as boolean,
    }

    // Plugin Configuration
    this.getPlatformLogSettings()
    this.getPlatformRateSettings()
    this.getPlatformConfigSettings()
    this.getVersion()

    // Finish initializing the platform
    this.debugLog(`Finished initializing platform: ${config.name}`);

    // verify the config
    (async () => {
      try {
        await this.verifyConfig()
        await this.debugLog('Config OK')
      } catch (e: any) {
        this.errorLog(`Verify Config, Error Message: ${e.message}, Submit Bugs Here: https://bit.ly/homebridge-cloudflared-tunnel-bug-report`)
        this.debugErrorLog(`Verify Config, Error: ${e}`)
      }
    })()

    // When this event is fired it means Homebridge has restored all cached accessories from disk.
    // Dynamic Platform plugins should only register new accessories after this event was fired,
    // in order to ensure they weren't added to homebridge already. This event can also be used
    // to start discovery of new accessories.
    this.api.on('didFinishLaunching', async () => {
      log.debug('Executed didFinishLaunching callback')
      // run the method to discover / register your devices as accessories
      try {
        await this.setupTunnelAccessory()
        await this.postAccessorySetup()

        if (this.config.domain) {
          await this.existingTunnel()
        } else {
          await this.createTunnel()
        }
      } catch (e: any) {
        this.errorLog(`Failed to Start Tunnel, Error Message: ${JSON.stringify(e.message)}`)
        this.debugErrorLog(JSON.stringify(e))
        await this.updateTunnelStatus(false, 'Tunnel failed to start')
      }
    })

    // The cloudflared child is not detached, but it is not killed with the parent
    // on POSIX either. Without this, restarting the child bridge left the old
    // cloudflared running with its connections open and started a second one
    // alongside it, so repeated restarts piled them up.
    this.api.on('shutdown', () => {
      this.tunnel?.stop()
      this.tunnel = undefined
    })
  }

  protected async postAccessorySetup(): Promise<void> {
    // Extension point for Matter platform registration.
  }

  protected shouldPublishHapTunnelAccessory(): boolean {
    return true
  }

  protected unregisterTunnelAccessoryIfPresent(): void {
    const existingAccessory = this.accessories.find(accessory => accessory.UUID === this.tunnelAccessoryUUID)
    if (!existingAccessory) {
      return
    }

    this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory])
    this.accessories = this.accessories.filter(accessory => accessory.UUID !== this.tunnelAccessoryUUID)
    this.tunnelAccessory = undefined
  }

  protected async setupTunnelAccessory(): Promise<void> {
    if (!this.shouldPublishHapTunnelAccessory()) {
      this.unregisterTunnelAccessoryIfPresent()
      return
    }

    const existingAccessory = this.accessories.find(accessory => accessory.UUID === this.tunnelAccessoryUUID)
    if (existingAccessory) {
      this.tunnelAccessory = existingAccessory
      this.configureTunnelAccessory(existingAccessory)
      return
    }

    const accessory = new this.api.platformAccessory(this.tunnelAccessoryName, this.tunnelAccessoryUUID)
    this.configureTunnelAccessory(accessory)
    this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory])
    this.accessories.push(accessory)
    this.tunnelAccessory = accessory
  }

  protected configureTunnelAccessory(accessory: PlatformAccessory): void {
    accessory
      .getService(this.hap.Service.AccessoryInformation)!
      .setCharacteristic(this.hap.Characteristic.Manufacturer, 'homebridge-plugins')
      .setCharacteristic(this.hap.Characteristic.Model, 'Cloudflared Tunnel Status')
      .setCharacteristic(this.hap.Characteristic.SerialNumber, 'cloudflared-tunnel-status')
      .setCharacteristic(this.hap.Characteristic.Name, this.tunnelAccessoryName)

    const statusService = accessory.getService(this.hap.Service.OccupancySensor)
      ?? accessory.addService(this.hap.Service.OccupancySensor, this.tunnelAccessoryName, 'TunnelStatus')

    statusService
      .setCharacteristic(this.hap.Characteristic.Name, this.tunnelAccessoryName)
      .setCharacteristic(
        this.hap.Characteristic.OccupancyDetected,
        this.tunnelRunning
          ? this.hap.Characteristic.OccupancyDetected.OCCUPANCY_DETECTED
          : this.hap.Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED,
      )
  }

  protected async updateTunnelStatus(running: boolean, reason: string): Promise<void> {
    this.tunnelRunning = running

    if (this.tunnelAccessory) {
      const statusService = this.tunnelAccessory.getService(this.hap.Service.OccupancySensor)
      statusService?.updateCharacteristic(
        this.hap.Characteristic.OccupancyDetected,
        running
          ? this.hap.Characteristic.OccupancyDetected.OCCUPANCY_DETECTED
          : this.hap.Characteristic.OccupancyDetected.OCCUPANCY_NOT_DETECTED,
      )
    }

    await this.onTunnelStatusChanged(running)
    await this.debugLog(`Tunnel status updated: running=${running}, reason=${reason}`)
  }

  // Extension point for Matter cluster state updates (parameter used by subclasses).
  // eslint-disable-next-line unused-imports/no-unused-vars
  protected async onTunnelStatusChanged(_running: boolean): Promise<void> {}

  /**
   * This function is invoked when homebridge restores cached accessories from disk at startup.
   * It should be used to setup event handlers for characteristics and update respective values.
   */
  configureAccessory(accessory: PlatformAccessory) {
    // this.infoLog(`Loading accessory from cache: ${accessory.displayName}`);

    // add the restored accessory to the accessories cache so we can track if it has already been registered
    this.accessories.push(accessory)

    if (accessory.UUID === this.tunnelAccessoryUUID) {
      this.tunnelAccessory = accessory
      this.configureTunnelAccessory(accessory)
    }
  }

  /**
   * Verify the config passed to the plugin is valid
   */
  async verifyConfig() {
    if (!this.config.url && (!this.config.protocol && !this.config.hostname && !this.config.port) && (!this.config.domain && !this.config.token)) {
      throw new Error('Missing required config: url or {protocol}://{hostname}:{port}, please check your config.json')
    }
    if (this.config.url && this.config.hostname) {
      throw new Error('Cannot have both url and hostname in config. Please remove one.')
    }
    if (this.config.domain && !this.config.token) {
      throw new Error('Missing required config: token, please check your config.json')
    }
    if (this.config.token && !this.config.domain) {
      this.warnLog('Missing config: domain, this is is needed to display in the logs which domain is being tunneled, please check your config.json')
    }
    if (!this.config.logging) {
      this.config.logging = 'standard'
    }
    if (!this.config.acceptCloudflareNotice) {
      this.config.acceptCloudflareNotice = false
    }
  }

  async existingTunnel() {
    const tunnel = new CloudflaredTunnel()
    this.tunnel = tunnel
    tunnel.token = this.config.token

    // The configured origin used to be dropped here, so a hardcoded
    // http://localhost:80 was passed to cloudflared whatever the owner had typed
    // in, with nothing in the log to say so
    tunnel.url = this.config.url
    await this.debugLog(`Tunnelling to: ${tunnel.url}`)
    tunnel.onChange((running, message) => {
      void this.debugLog(message)
      void this.updateTunnelStatus(running, message)
    })
    tunnel.onError((message) => {
      void this.warnLog(message)
      void this.updateTunnelStatus(false, message)
    })
    await this.infoLog(`Starting Tunnel with Domain: ${this.config.domain}`)
    tunnel.start()
  }

  async createTunnel() {
    await this.debugLog(JSON.stringify(redactConfig(this.config)))
    // The local server URL to tunnel.
    const options: TunnelOptions = {
      url: this.config.url,
      protocol: this.config.protocol,
      hostname: this.config.hostname,
      port: this.config.port,
      verifyTLS: this.config.verifyTLS,
      acceptCloudflareNotice: this.config.acceptCloudflareNotice,
    }
    await this.debugWarnLog(`Starting Tunnel with Options: ${JSON.stringify(options)}`)
    const autoTunnel = await startTunnel(options)
    if (autoTunnel) {
      const tunnelURL = await autoTunnel.getURL()
      await this.infoLog(`Tunnel URL: ${JSON.stringify(tunnelURL)}`)
      await this.updateTunnelStatus(true, 'Tunnel started')
    } else {
      await this.updateTunnelStatus(false, 'Tunnel did not start')
    }
  }

  async getPlatformLogSettings() {
    // `debugMode` was worked out here by looking for `-D` in the plugin's own
    // process arguments. That is right in the main Homebridge process and wrong
    // in a child bridge, which only receives `-D` when that bridge has its own
    // debug setting turned on - so with debug enabled globally the plugin
    // decided debug was off and printed nothing.
    //
    // Nothing needs deciding: 'debugMode' routes debug lines to Homebridge's
    // own debug logger, which prints them only when debug is actually on, in
    // either kind of process. An explicit `logging` in the config still wins.
    //
    // These settings live at the top level of the config, which is where the
    // settings UI writes them. They used to be read from `config.options`, a key
    // this plugin never creates - so every one of them was silently ignored and
    // the logging level the owner chose did nothing at all.
    this.platformLogging = (this.config.logging === 'debug' || this.config.logging === 'standard'
      || this.config.logging === 'none')
      ? this.config.logging
      : 'debugMode'
    const logging = this.config.logging ? 'Platform Config' : 'Default'
    await this.debugLog(`Using ${logging} Logging: ${this.platformLogging}`)
  }

  async getPlatformRateSettings() {
    // RefreshRate
    this.platformRefreshRate = this.config.refreshRate ? this.config.refreshRate : undefined
    const refreshRate = this.config.refreshRate ? 'Using Platform Config refreshRate' : 'Platform Config refreshRate Not Set'
    await this.debugLog(`${refreshRate}: ${this.platformRefreshRate}`)
    // UpdateRate
    this.platformUpdateRate = this.config.updateRate ? this.config.updateRate : undefined
    const updateRate = this.config.updateRate ? 'Using Platform Config updateRate' : 'Platform Config updateRate Not Set'
    await this.debugLog(`${updateRate}: ${this.platformUpdateRate}`)
    // PushRate
    this.platformPushRate = this.config.pushRate ? this.config.pushRate : undefined
    const pushRate = this.config.pushRate ? 'Using Platform Config pushRate' : 'Platform Config pushRate Not Set'
    await this.debugLog(`${pushRate}: ${this.platformPushRate}`)
  }

  async getPlatformConfigSettings() {
    const platformConfig: CloudflaredTunnelPlatformConfig = {
      platform: 'CloudflaredTunnel',
    }
    platformConfig.logging = this.config.logging ? this.config.logging : undefined
    platformConfig.refreshRate = this.config.refreshRate ? this.config.refreshRate : undefined
    platformConfig.updateRate = this.config.updateRate ? this.config.updateRate : undefined
    platformConfig.pushRate = this.config.pushRate ? this.config.pushRate : undefined
    if (Object.entries(platformConfig).length !== 0) {
      await this.debugLog(`Platform Config: ${JSON.stringify(platformConfig)}`)
    }
    this.platformConfig = platformConfig
  }

  /**
   * Asynchronously retrieves the version of the plugin from the package.json file.
   *
   * This method reads the package.json file located in the parent directory,
   * parses its content to extract the version, and logs the version using the debug logger.
   * The extracted version is then assigned to the `version` property of the class.
   *
   * @returns {Promise<void>} A promise that resolves when the version has been retrieved and logged.
   */
  async getVersion(): Promise<void> {
    const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'))
    this.debugLog(`Plugin Version: ${version}`)
    this.version = version
  }

  /**
   * Validate and clean a string value for a Name Characteristic.
   * @param displayName - The display name of the accessory.
   * @param name - The name of the characteristic.
   * @param value - The value to be validated and cleaned.
   * @returns The cleaned string value.
   */
  async validateAndCleanDisplayName(displayName: string, name: string, value: string): Promise<string> {
    if (this.config.options?.allowInvalidCharacters) {
      return value
    } else {
      const validPattern = /^[\p{L}\p{N}][\p{L}\p{N} ']*[\p{L}\p{N}]$/u
      const invalidCharsPattern = /[^\p{L}\p{N} ']/gu
      const invalidStartEndPattern = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu

      if (typeof value === 'string' && !validPattern.test(value)) {
        this.warnLog(`WARNING: The accessory '${displayName}' has an invalid '${name}' characteristic ('${value}'). Please use only alphanumeric, space, and apostrophe characters. Ensure it starts and ends with an alphabetic or numeric character, and avoid emojis. This may prevent the accessory from being added in the Home App or cause unresponsiveness.`)

        // Remove invalid characters
        if (invalidCharsPattern.test(value)) {
          const before = value
          this.warnLog(`Removing invalid characters from '${name}' characteristic, if you feel this is incorrect,  please enable \'allowInvalidCharacter\' in the config to allow all characters`)
          value = value.replace(invalidCharsPattern, '')
          this.warnLog(`${name} Before: '${before}' After: '${value}'`)
        }

        // Ensure it starts and ends with an alphanumeric character
        if (invalidStartEndPattern.test(value)) {
          const before = value
          this.warnLog(`Removing invalid starting or ending characters from '${name}' characteristic, if you feel this is incorrect, please enable \'allowInvalidCharacter\' in the config to allow all characters`)
          value = value.replace(invalidStartEndPattern, '')
          this.warnLog(`${name} Before: '${before}' After: '${value}'`)
        }
      }

      return value
    }
  }

  /**
   * If device level logging is turned on, log to log.warn
   * Otherwise send debug logs to log.debug
   */
  async infoLog(...log: any[]): Promise<void> {
    if (await this.enablingPlatformLogging()) {
      this.log.info(String(...log))
    }
  }

  async successLog(...log: any[]): Promise<void> {
    if (await this.enablingPlatformLogging()) {
      this.log.success(String(...log))
    }
  }

  async debugSuccessLog(...log: any[]): Promise<void> {
    if (await this.enablingPlatformLogging()) {
      if (await this.loggingIsDebug()) {
        this.log.success('[DEBUG]', String(...log))
      }
    }
  }

  async warnLog(...log: any[]): Promise<void> {
    if (await this.enablingPlatformLogging()) {
      this.log.warn(String(...log))
    }
  }

  async debugWarnLog(...log: any[]): Promise<void> {
    if (await this.enablingPlatformLogging()) {
      if (await this.loggingIsDebug()) {
        this.log.warn('[DEBUG]', String(...log))
      }
    }
  }

  async errorLog(...log: any[]): Promise<void> {
    if (await this.enablingPlatformLogging()) {
      this.log.error(String(...log))
    }
  }

  async debugErrorLog(...log: any[]): Promise<void> {
    if (await this.enablingPlatformLogging()) {
      if (await this.loggingIsDebug()) {
        this.log.error('[DEBUG]', String(...log))
      }
    }
  }

  async debugLog(...log: any[]): Promise<void> {
    if (await this.enablingPlatformLogging()) {
      if (this.platformLogging === 'debugMode') {
        this.log.debug(String(...log))
      } else if (this.platformLogging === 'debug') {
        this.log.info('[DEBUG]', String(...log))
      }
    }
  }

  async loggingIsDebug(): Promise<boolean> {
    return this.platformLogging === 'debugMode' || this.platformLogging === 'debug'
  }

  async enablingPlatformLogging(): Promise<boolean> {
    return this.platformLogging === 'debugMode' || this.platformLogging === 'debug' || this.platformLogging === 'standard'
  }
}
