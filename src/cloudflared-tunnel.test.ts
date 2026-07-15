import { describe, expect, it, vi } from 'vitest'

import { CloudflaredTunnel } from './cloudflared-tunnel.js'

describe('cloudflaredTunnel', () => {
  it('should emit lifecycle change and error events to registered handlers', () => {
    const tunnel = new CloudflaredTunnel('cloudflared')
    const onChange = vi.fn()
    const onError = vi.fn()

    tunnel.onChange(onChange)
    tunnel.onError(onError)

    tunnel.emitChange('Starting cloudflared')
    tunnel.emitError('Cloudflared error')

    expect(onChange).toHaveBeenCalledWith(false, 'Starting cloudflared', undefined)
    expect(onError).toHaveBeenCalledWith('Cloudflared error')
  })

  it('should normalize install command token input to the actual token value', () => {
    const tunnel = new CloudflaredTunnel('cloudflared')

    tunnel.token = 'cloudflared.exe service install abc123'

    expect(tunnel.token).toBe('abc123')
  })
})
