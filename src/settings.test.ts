import type { CloudflaredTunnelPlatformConfig, devicesConfig } from './settings'

import { describe, expect, it } from 'vitest'

import { PLATFORM_NAME, PLUGIN_NAME } from './settings.js'

describe('settings', () => {
  it('should have correct PLATFORM_NAME', () => {
    expect(PLATFORM_NAME).toBe('CloudflaredTunnel')
  })

  it('should have correct PLUGIN_NAME', () => {
    expect(PLUGIN_NAME).toBe('@homebridge-plugins/homebridge-cloudflared-tunnel')
  })

  it('should have correct CloudflaredTunnelPlatformConfig interface', () => {
    const config: CloudflaredTunnelPlatformConfig = {
      domain: 'example.com',
      token: 'token',
      url: 'http://example.com',
      port: 8080,
      hostname: 'hostname',
      protocol: 'https',
      verifyTLS: true,
      acceptCloudflareNotice: true,
      refreshRate: 60,
      updateRate: 60,
      pushRate: 60,
      logging: 'info',
      platform: 'CloudflaredTunnel',
    }
    expect(config.domain).toBe('example.com')
    expect(config.token).toBe('token')
    expect(config.url).toBe('http://example.com')
    expect(config.port).toBe(8080)
    expect(config.hostname).toBe('hostname')
    expect(config.protocol).toBe('https')
    expect(config.verifyTLS).toBe(true)
    expect(config.acceptCloudflareNotice).toBe(true)
    expect(config.refreshRate).toBe(60)
    expect(config.updateRate).toBe(60)
    expect(config.pushRate).toBe(60)
    expect(config.logging).toBe('info')
  })

  it('should have correct devicesConfig interface', () => {
    const config: devicesConfig = {
      refreshRate: 60,
      updateRate: 60,
      pushRate: 60,
      logging: 'info',
      firmware: '1.0.0',
    }
    expect(config.refreshRate).toBe(60)
    expect(config.updateRate).toBe(60)
    expect(config.pushRate).toBe(60)
    expect(config.logging).toBe('info')
    expect(config.firmware).toBe('1.0.0')
  })
})
