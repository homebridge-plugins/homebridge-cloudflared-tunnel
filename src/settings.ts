/* Copyright(C) 2023-2024, donavanbecker (https://github.com/donavanbecker). All rights reserved.
 *
 * settings.ts: @homebridge-plugins/homebridge-cloudflared-tunnel.
 */
import type { PlatformConfig } from 'homebridge'
import type { TunnelOptions } from 'untun'
/**
 * This is the name of the platform that users will use to register the plugin in the Homebridge config.json
 */
export const PLATFORM_NAME = 'CloudflaredTunnel'

/**
 * This must match the name of your plugin as defined the package.json
 */
export const PLUGIN_NAME = '@homebridge-plugins/homebridge-cloudflared-tunnel'

// Config
export interface CloudflaredTunnelPlatformConfig extends PlatformConfig {
  domain?: string
  token?: string
  url?: TunnelOptions['url']
  port?: TunnelOptions['port']
  hostname?: TunnelOptions['hostname']
  protocol?: TunnelOptions['protocol']
  verifyTLS?: TunnelOptions['verifyTLS']
  acceptCloudflareNotice?: TunnelOptions['acceptCloudflareNotice']
  refreshRate?: number
  updateRate?: number
  pushRate?: number
  logging?: string
}

export interface devicesConfig {
  refreshRate: number
  updateRate: number
  pushRate: number
  logging: string
  firmware: string
}
