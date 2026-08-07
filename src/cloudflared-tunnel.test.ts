import { describe, expect, it, vi } from 'vitest'

import { cloudflaredErrorLines, CloudflaredTunnel } from './cloudflared-tunnel.js'

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

/**
 * cloudflared writes everything to stderr, including the INF lines a healthy
 * tunnel produces. Every one of those used to be reported as an error, which put
 * an unactionable warning in the log and flipped the status accessory to "not
 * running" while the tunnel was up.
 */
describe('reading cloudflared\'s output', () => {
  it('ignores the routine lines a working tunnel prints', () => {
    const healthy = [
      '2026-08-07T20:11:04Z INF Starting tunnel tunnelID=1a2b3c',
      '2026-08-07T20:11:05Z INF Registered tunnel connection connIndex=0 location=lhr01',
      '2026-08-07T20:11:05Z INF Updated to new configuration version=3',
      '2026-08-07T20:11:06Z DBG Sending keepalive',
    ].join('\n')

    expect(cloudflaredErrorLines(healthy)).toEqual([])
  })

  it('still reports the lines cloudflared marks as a failure', () => {
    const failing = [
      '2026-08-07T20:11:04Z INF Registered tunnel connection connIndex=0',
      '2026-08-07T20:11:44Z ERR Failed to serve tunnel connection error="connection refused"',
      '2026-08-07T20:11:45Z FTL Cannot determine default origin certificate path',
    ].join('\n')

    expect(cloudflaredErrorLines(failing)).toEqual([
      '2026-08-07T20:11:44Z ERR Failed to serve tunnel connection error="connection refused"',
      '2026-08-07T20:11:45Z FTL Cannot determine default origin certificate path',
    ])
  })

  it('does not report a warning as a failure', () => {
    expect(cloudflaredErrorLines('2026-08-07T20:11:04Z WRN Retrying connection in 2s')).toEqual([])
  })

  it('ignores the blank line at the end of a chunk', () => {
    expect(cloudflaredErrorLines('2026-08-07T20:11:04Z ERR Something broke\n')).toHaveLength(1)
  })
})
