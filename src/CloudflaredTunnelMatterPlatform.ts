/* Copyright(C) 2023-2024, donavanbecker (https://github.com/donavanbecker). All rights reserved.
 *
 * CloudflaredTunnelMatterPlatform.ts: @homebridge-plugins/homebridge-cloudflared-tunnel.
 */
import type { API, Logging, PlatformAccessory } from 'homebridge'

import type { CloudflaredTunnelPlatformConfig } from './settings.js'

import { CloudflaredTunnelPlatform } from './platform.js'

/**
 * CloudflaredTunnelMatterPlatform
 * Matter-enabled platform class that extends CloudflaredTunnelPlatform.
 * Used when Homebridge v2.0 Matter support is available and enabled.
 */
export class CloudflaredTunnelMatterPlatform extends CloudflaredTunnelPlatform {
  constructor(
    log: Logging,
    config: CloudflaredTunnelPlatformConfig,
    api: API,
  ) {
    super(log, config, api)
    this.debugLog('CloudflaredTunnelMatterPlatform initialized with Matter support')
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
