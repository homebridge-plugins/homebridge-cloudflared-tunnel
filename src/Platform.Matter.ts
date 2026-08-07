/* Copyright(C) 2023-2024, donavanbecker (https://github.com/donavanbecker). All rights reserved.
 *
 * Platform.Matter.ts: @homebridge-plugins/homebridge-cloudflared-tunnel.
 */
import type { API, Logging, MatterAccessory, PlatformAccessory } from 'homebridge'

import type { CloudflaredTunnelPlatformConfig } from './settings.js'

import { CloudflaredTunnelPlatform } from './Platform.HAP.js'
import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js'

/**
 * CloudflaredTunnelMatterPlatform
 * Matter-enabled platform class that extends CloudflaredTunnelPlatform.
 * Used when Homebridge v2.0 Matter support is available and enabled.
 */
export class CloudflaredTunnelMatterPlatform extends CloudflaredTunnelPlatform {
  /**
   * Matter's BridgedDeviceBasicInformation.NodeLabel is constrained to 32 characters.
   * Homebridge sets the nodeLabel from the accessory displayName, so longer names make
   * the whole endpoint fail to register with "Behaviors have errors".
   */
  private clampMatterDisplayName(displayName: string): string {
    if (displayName.length <= 32) {
      return displayName
    }
    const clamped = displayName.slice(0, 32).trim()
    this.log.debug(`Display name "${displayName}" exceeds Matter's 32 character limit, using "${clamped}"`)
    return clamped
  }

  private matterTunnelAccessoryRegistered = false

  constructor(
    log: Logging,
    config: CloudflaredTunnelPlatformConfig,
    api: API,
  ) {
    super(log, config, api)
    const enableMatter = this.config?.enableMatter ?? true

    void this.infoLog(`Matter mode active (enableMatter=${enableMatter})`)
    void this.debugLog('CloudflaredTunnelMatterPlatform initialized with Matter support')
    void this.debugLog('Tunnel lifecycle behavior is identical in HAP and Matter modes.')
  }

  protected override shouldPublishHapTunnelAccessory(): boolean {
    // Matter mode replaces the HAP accessory - but only once the Matter API is
    // known to be there. This used to return false outright, so on a build where
    // Matter looks enabled but `api.matter` is not populated the cached HAP
    // accessory was removed first and nothing replaced it. The owner lost the
    // tile, its room and its automations, while the log claimed the plugin was
    // "continuing with HAP accessory only".
    return !this.api.matter
  }

  protected override async postAccessorySetup(): Promise<void> {
    await super.postAccessorySetup()

    if (!this.api.matter) {
      await this.warnLog('Matter API is unavailable at runtime; continuing with HAP accessory only.')
      return
    }

    const matterAccessory: MatterAccessory = {
      UUID: this.tunnelAccessoryUUID,
      displayName: this.clampMatterDisplayName(this.tunnelAccessoryName),
      deviceType: this.api.matter.deviceTypes.MotionSensor,
      serialNumber: 'cloudflared-tunnel-status',
      manufacturer: 'homebridge-plugins',
      model: 'Cloudflared Tunnel Status',
      context: {
        mode: 'matter',
      },
      clusters: {
        occupancySensing: {
          occupancy: {
            occupied: this.tunnelRunning,
          },
        },
      },
    }

    await this.api.matter.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [matterAccessory])
    this.matterTunnelAccessoryRegistered = true
    await this.debugLog(`Registered Matter accessory: ${matterAccessory.displayName}`)
  }

  protected override async onTunnelStatusChanged(running: boolean): Promise<void> {
    await super.onTunnelStatusChanged(running)

    if (!this.api.matter || !this.matterTunnelAccessoryRegistered) {
      return
    }

    await this.api.matter.updateAccessoryState(
      this.tunnelAccessoryUUID,
      this.api.matter.clusterNames.OccupancySensing,
      {
        occupancy: {
          occupied: running,
        },
      },
    )
  }

  /**
   * Invoked by Homebridge when it restores cached accessories from disk at startup.
   * Explicitly delegates to the base class implementation so that previously cached
   * HAP accessories are tracked in this.accessories and available for the HAP
   * fallback path, preventing duplicate registrations.
   */
  override configureAccessory(accessory: PlatformAccessory): void {
    super.configureAccessory(accessory)
  }
}
