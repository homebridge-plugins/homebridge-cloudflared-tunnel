# Copilot instructions

Guidance for AI coding agents working in this repository. The fuller version of this document is [CLAUDE.md](../CLAUDE.md) at the repo root — keep the two in sync.

## Commands

- Build: `npm run build` (`rimraf ./dist` → `tsc` → copy plugin UI html). All steps are required for a working package.
- Lint: `npm run lint` (`eslint . --max-warnings=0`, CI fails on warnings); `npm run lint:fix` to autofix.
- Test: `npm test` (vitest, colocated `src/*.test.ts`).
- Local dev loop: `npm run watch` (rebuild + restart `homebridge -U ./test/hbConfig -D` on changes; `./test/hbConfig` is gitignored, create locally).

## Key architecture facts

- Homebridge dynamic platform plugin that runs a Cloudflare Tunnel alongside Homebridge and surfaces tunnel status in HomeKit.
- `src/index.ts` registers a runtime HAP/Matter proxy: Matter mode is the default when available (`enableMatter: true`); HAP mode otherwise, with automatic fallback.
- Quick tunnels use the `untun` package (`startTunnel`); named tunnels spawn a supervised `cloudflared` child process via `src/cloudflared-tunnel.ts` (binary located with `command-exists`).
- Tunnel status propagates through `onTunnelStatusChanged`: HAP publishes an Occupancy Sensor, Matter overrides with a Motion Sensor endpoint (occupancySensing cluster).
- Use the platform's leveled log helpers (`infoLog`, `debugLog`, …) so user logging settings are respected.

## Conventions

- TypeScript ESM: relative imports need `.js` extensions.
- ESLint `@antfu/eslint-config`: single quotes, sorted exports; run `npm run lint:fix` before committing.
- `config.schema.json` must stay in sync with the config interface in `src/settings.ts`.
- Use `Error & { code?: string }` style inline types rather than `NodeJS.*` types.
- Copyright headers in `src/` credit @donavanbecker (original author) — leave them in place.
