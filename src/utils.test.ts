import type { API, Logging, PlatformConfig } from 'homebridge'

import { describe, expect, it, vi } from 'vitest'

import { createPlatformProxy } from './utils.js'

function makeLog(): Logging {
  return { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn(), success: vi.fn() } as unknown as Logging
}

function makeConfig(extra: Record<string, any> = {}): PlatformConfig {
  return { platform: 'CloudflaredTunnel', ...extra }
}

function makeApi(matterAvailable = false, matterEnabled = false): API {
  return {
    isMatterAvailable: vi.fn().mockReturnValue(matterAvailable),
    isMatterEnabled: vi.fn().mockReturnValue(matterEnabled),
  } as unknown as API
}

function makeApiWithoutMatterMethods(): API {
  return {} as API
}

describe('createPlatformProxy', () => {
  it('should fall back to HAPPlatform when Matter is not available', () => {
    const HAPPlatform = vi.fn()
    const MatterPlatform = vi.fn()
    const ProxyCtor = createPlatformProxy(HAPPlatform as any, MatterPlatform as any)

    void new ProxyCtor(makeLog(), makeConfig(), makeApi(false, false))

    expect(HAPPlatform).toHaveBeenCalledOnce()
    expect(MatterPlatform).not.toHaveBeenCalled()
  })

  it('should instantiate MatterPlatform when Matter is available and enabled in config', () => {
    const HAPPlatform = vi.fn()
    const MatterPlatform = vi.fn()
    const ProxyCtor = createPlatformProxy(HAPPlatform as any, MatterPlatform as any)

    void new ProxyCtor(makeLog(), makeConfig({ enableMatter: true }), makeApi(true, true))

    expect(MatterPlatform).toHaveBeenCalledOnce()
    expect(HAPPlatform).not.toHaveBeenCalled()
  })

  it('should default enableMatter to true and use Matter when available', () => {
    const HAPPlatform = vi.fn()
    const MatterPlatform = vi.fn()
    const ProxyCtor = createPlatformProxy(HAPPlatform as any, MatterPlatform as any)

    // No enableMatter in config → defaults to true
    void new ProxyCtor(makeLog(), makeConfig(), makeApi(true, true))

    expect(MatterPlatform).toHaveBeenCalledOnce()
    expect(HAPPlatform).not.toHaveBeenCalled()
  })

  it('should fall back to HAPPlatform when enableMatter is false', () => {
    const HAPPlatform = vi.fn()
    const MatterPlatform = vi.fn()
    const ProxyCtor = createPlatformProxy(HAPPlatform as any, MatterPlatform as any)

    void new ProxyCtor(makeLog(), makeConfig({ enableMatter: false }), makeApi(true, true))

    expect(HAPPlatform).toHaveBeenCalledOnce()
    expect(MatterPlatform).not.toHaveBeenCalled()
  })

  it('should fall back to HAPPlatform when config is falsy', () => {
    const HAPPlatform = vi.fn()
    const MatterPlatform = vi.fn()
    const ProxyCtor = createPlatformProxy(HAPPlatform as any, MatterPlatform as any)

    void new ProxyCtor(makeLog(), null as any, makeApi(true, true))

    expect(HAPPlatform).toHaveBeenCalledOnce()
    expect(MatterPlatform).not.toHaveBeenCalled()
  })

  it('should fall back to HAPPlatform when API has no Matter methods', () => {
    const HAPPlatform = vi.fn()
    const MatterPlatform = vi.fn()
    const ProxyCtor = createPlatformProxy(HAPPlatform as any, MatterPlatform as any)

    void new ProxyCtor(makeLog(), makeConfig({ enableMatter: true }), makeApiWithoutMatterMethods())

    expect(HAPPlatform).toHaveBeenCalledOnce()
    expect(MatterPlatform).not.toHaveBeenCalled()
  })

  it('should fall back to HAPPlatform when MatterPlatform throws during initialization', () => {
    const log = makeLog()
    const HAPPlatform = vi.fn()
    const MatterPlatform = class {
      constructor() {
        throw new Error('matter init failed')
      }
    }
    const ProxyCtor = createPlatformProxy(HAPPlatform as any, MatterPlatform as any)

    void new ProxyCtor(log, makeConfig({ enableMatter: true }), makeApi(true, true))

    expect(HAPPlatform).toHaveBeenCalledOnce()
    expect(log.error).toHaveBeenCalledWith(
      'Matter platform failed to initialize, falling back to HAP platform.',
      'matter init failed',
    )
  })
})
