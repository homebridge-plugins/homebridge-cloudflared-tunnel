/* Copyright(C) 2023-2024, donavanbecker (https://github.com/donavanbecker). All rights reserved.
 *
 * utils.ts: @homebridge-plugins/homebridge-cloudflared-tunnel.
 */
import type { API, Logging, PlatformConfig } from 'homebridge'

/** Constructor type matching the Homebridge platform constructor signature. */
type PlatformConstructor = new (log: Logging, config: PlatformConfig, api: API) => any

interface MatterApiShape {
  isMatterAvailable?: () => boolean
  isMatterEnabled?: () => boolean
}

function isMatterRuntimeReady(api: API): boolean {
  const matterApi = api as API & MatterApiShape
  const matterAvailable = matterApi.isMatterAvailable?.() === true
  const matterEnabled = matterApi.isMatterEnabled?.() === true
  return matterAvailable && matterEnabled
}

/**
 * Creates a proxy class that instantiates the correct platform implementation
 * (HAP or Matter) at runtime, based on the plugin configuration and Homebridge
 * Matter availability.
 *
 * @param HAPPlatform - The HAP platform class constructor.
 * @param MatterPlatform - The Matter platform class constructor.
 * @returns A proxy class that delegates to the correct platform implementation.
 */
export function createPlatformProxy(HAPPlatform: PlatformConstructor, MatterPlatform: PlatformConstructor): PlatformConstructor {
  return class CloudflaredTunnelPlatformProxy {
    /** The instantiated platform implementation (HAP or Matter) */
    private impl: any

    /**
     * Constructs the proxy and instantiates the correct platform implementation.
     * Falls back to the HAP platform when config is falsy (matching the original
     * platform guard) or when Matter is not available/enabled.
     * @param log - Logger instance
     * @param config - Platform config
     * @param api - Homebridge API instance
     */
    constructor(log: Logging, config: PlatformConfig, api: API) {
      if (!config) {
        this.impl = new HAPPlatform(log, config, api)
        return
      }

      const cfg = config as PlatformConfig & { enableMatter?: boolean }
      const enableMatter = cfg.enableMatter ?? true
      const useMatter = enableMatter && MatterPlatform && isMatterRuntimeReady(api)

      if (useMatter) {
        try {
          this.impl = new MatterPlatform(log, config, api)
          return
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error)
          log.error('Matter platform failed to initialize, falling back to HAP platform.', message)
        }
      }

      // Fallback to HAP
      this.impl = new HAPPlatform(log, config, api)
    }
  } as unknown as PlatformConstructor
}
