import type { API } from 'homebridge'

import { describe, expect, it, vi } from 'vitest'

import registerPlatform from '../index.js'
import { CloudflaredTunnelPlatform } from '../platform.js'
import { PLATFORM_NAME, PLUGIN_NAME } from '../settings.js'

// FILE: tests/index.test.ts

describe('index.ts', () => {
  it('should register the platform with homebridge', () => {
    const mockAPI = {
      registerPlatform: vi.fn(),
    } as unknown as API

    registerPlatform(mockAPI)

    expect(mockAPI.registerPlatform).toHaveBeenCalledWith(PLUGIN_NAME, PLATFORM_NAME, CloudflaredTunnelPlatform)
  })
})
