/* Copyright(C) 2023-2024, donavanbecker (https://github.com/donavanbecker). All rights reserved.
 *
 * cloudflared-tunnel.ts: homebridge-cloudflared-tunnel.
 */
import * as childProcess from 'node:child_process'
import * as process from 'node:process'

import { sync as commandExistsSync } from 'command-exists'

class CloudflaredTunnel {
  private cloudflaredPath: string
  private _token: string | undefined
  private url: string
  private hostname: string
  private running: boolean
  private childProcess: childProcess.ChildProcess | null
  private change: ((running: boolean, msg: string, code?: number) => void) | undefined
  private error: ((msg: string) => void) | undefined

  constructor(cloudflaredPath: string = 'cloudflared') {
    this.cloudflaredPath = cloudflaredPath
    this.url = 'http://localhost:80'
    this.hostname = ''
    this.running = false
    this.childProcess = null
  }

  get token(): string | undefined {
    return this._token
  }

  set token(token: string | undefined) {
    if (token && typeof token === 'string') {
      token = token.trim()

      // try to strip out "cloudflared.exe service install"
      const array = token.split(' ')
      if (array.length > 1) {
        for (let i = 0; i < array.length - 1; i++) {
          if (array[i] === 'install') {
            token = array[i + 1]
          }
        }
      }
    }

    this._token = token
  }

  checkInstalled(): boolean {
    return commandExistsSync(this.cloudflaredPath)
  }

  emitChange(msg: string, code?: number): void {
    if (this.change) {
      this.change(this.running, msg, code)
    }
  }

  emitError(msg: string): void {
    if (this.error) {
      this.error(msg)
    }
  }

  start(): void {
    if (this.childProcess) {
      this.emitError('Already started')
      return
    }

    if (!this.checkInstalled()) {
      this.emitError(`Cloudflared error: ${this.cloudflaredPath} is not found`)
      return
    }

    if (!this.token) {
      this.emitError('Cloudflared error: Token is not set')
      return
    }

    const args: string[] = [
      'tunnel',
      '--no-autoupdate',
    ]

    if (this.hostname) {
      args.push('--hostname')
      args.push(this.hostname)
    }

    if (this.url) {
      args.push('--url')
      args.push(this.url)
    }

    args.push('run')
    args.push('--token')
    args.push(this.token)

    this.running = true
    this.emitChange('Starting cloudflared')
    this.childProcess = childProcess.spawn(this.cloudflaredPath, args)
    if (this.childProcess && this.childProcess.stdout) {
      this.childProcess.stdout.pipe(process.stdout)
    }
    if (this.childProcess && this.childProcess.stderr) {
      this.childProcess.stderr.pipe(process.stderr)
    }

    this.childProcess.on('close', (code) => {
      this.running = false
      this.childProcess = null
      this.emitChange('Stopped cloudflared', code ?? undefined)
    })

    this.childProcess.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'ENOENT') {
        this.emitError(`Cloudflared error: ${this.cloudflaredPath} is not found`)
      } else {
        this.emitError(err.message)
      }
    })

    if (this.childProcess && this.childProcess.stderr) {
      this.childProcess.stderr.on('data', (data: any) => {
        this.emitError(data.toString())
      })
    }
  }

  stop(): void {
    this.emitChange('Stopping cloudflared')
    if (this.childProcess) {
      this.childProcess.kill('SIGINT')
      this.childProcess = null
    }
  }
}

export { CloudflaredTunnel }
