# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run build` — `rimraf ./dist && tsc && npm run plugin-ui`. The `plugin-ui` step rsyncs `src/homebridge-ui/public/index.html` into `dist/` (the UI server itself is TypeScript and compiled by `tsc`). Skipping it produces a broken published package.
- `npm run lint` — ESLint over the whole repo with `--max-warnings=0`. CI fails on any warning. `npm run lint:fix` to autofix.
- `npm test` — vitest, colocated `src/*.test.ts` files (configured in `vitest.config.ts` to exclude `dist/`). `npm run test:watch` and `npm run test-coverage` also available.
- `npm run watch` — build, `npm link`, then `nodemon`: recompiles and restarts `homebridge -U ./test/hbConfig -D` on `src/**/*.ts` changes. `./test/hbConfig` is gitignored; create it locally.
- `npm run docs` — typedoc into `docs/` (gitignored — generated output is never committed).
- `npm run prepublishOnly` — lint then build; runs automatically on publish.

CI (`.github/workflows/build.yml`) runs install + lint on Node 22.x/24.x. Releases publish via `.github/workflows/release.yml`: a GitHub release (tag `vX.Y.Z`) publishes to npm's `latest` tag; pushes to `beta-X.Y.Z` / `alpha-X.Y.Z` branches publish incrementing prerelease versions to the `beta` / `alpha` tags.

Supported Node: `^22.12.0 || ^24.0.0`. Homebridge: `^2.0.0`.

## Architecture

Homebridge dynamic platform plugin (`platform: "CloudflaredTunnel"`, package `@homebridge-plugins/homebridge-cloudflared-tunnel`) that runs a Cloudflare Tunnel alongside Homebridge for remote access, and surfaces the tunnel status in HomeKit.

### HAP/Matter platform selection (`src/index.ts` + `src/utils.ts`)

Registers a runtime proxy: `CloudflaredTunnelMatterPlatform` (`src/Platform.Matter.ts`, extends the HAP platform) is used when Homebridge reports Matter available+enabled and `enableMatter` is true (the default); otherwise `CloudflaredTunnelPlatform` (`src/Platform.HAP.ts`). Falls back to HAP automatically when Matter initialisation fails.

### Tunnel modes (`src/Platform.HAP.ts`)

Two ways to start the tunnel:
- **Quick tunnel** via the `untun` package's `startTunnel` (random `trycloudflare.com` URL). Requires `acceptCloudflareNotice` in config.
- **Named tunnel** via `src/cloudflared-tunnel.ts` — a `CloudflaredTunnel` class that spawns and supervises a `cloudflared` child process (found via `command-exists`), with the user's own domain/token. Child-process errors are caught (missing binary → friendly error).

Tunnel lifecycle status propagates to accessory state via `onTunnelStatusChanged`: the HAP platform publishes an Occupancy Sensor; the Matter platform overrides the hook and publishes a Motion Sensor endpoint (occupancySensing cluster) instead — it deliberately does not publish the HAP status accessory.

### Logging

Leveled log helpers (`infoLog`, `warnLog`, `errorLog`, `debugLog`, …) gated by `config.logging`. Use these instead of `this.log` directly so user log settings are respected.

## Conventions

- TypeScript ESM (`"type": "module"`): relative imports use `.js` extensions even from `.ts` source.
- ESLint is `@antfu/eslint-config` (flat config in `eslint.config.js`): single quotes, 1tbs braces, `curly` multi-line only, sorted exports. Run `npm run lint:fix` before committing.
- `config.schema.json` defines the Homebridge UI form and must stay in sync with the config interface in `src/settings.ts`.
- Use `Error & { code?: string }` style inline types rather than `NodeJS.*` types (the lint setup has no Node globals).
- Copyright headers in `src/` credit @donavanbecker, the original plugin author — leave them in place.
