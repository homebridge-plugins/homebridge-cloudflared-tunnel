## v2.1.4 (Pending Release)

### Changed

- chore: keep test files out of the published package
- chore(github): run the build and tests in ci, on node 22, 24 and 26
- chore: use the same lint setup across every plugin
- chore: add a changelog:sync script to populate the pending section from the commits
- chore: count a repeated commit subject once when syncing the changelog
- chore(github): check the changelog against the commits in ci
- chore: restore the original author and remove personal funding links
- docs: add node 26 to the supported node versions
- chore: allow dependency install scripts by package name rather than pinned version, so a version bump cannot silently block a native build
- chore: exclude test files and the test config from the published package
- fix: restore debug logging when the plugin runs in a child bridge
- fix: read the plugin settings from where they are actually saved, so the logging level works
- fix: stop reporting a healthy tunnel's normal output as an error
- fix: use the configured local address on the token path, instead of a hardcoded one
- fix: stop the cloudflared process on shutdown, so restarts do not leave one behind

## v2.1.3 (2026-07-27)

### Changed

- chore(github): allow the codeql scan to be started manually
- chore(github): stop concurrent release runs racing for the same version
- chore: add the supports-matter keyword
- chore(github): use the shared homebridge action to deprecate past pre-releases
- style(ui): standardise the custom ui layout and sync the support tab with the readme
- fix(schema): declare required fields the standard way so the homebridge ui stops reporting a config validation failure
- chore: declare the supports-hap transport keyword for the homebridge ui
- fix: mask credentials in debug logs so shared logs cannot leak them
- chore(deps): dependency updates
- docs(changelog): list every unreleased commit in the pending section

## v2.1.2 (2026-07-20)

### Changed

- fix(schema): give the logging levels clear, distinct names
- chore(deps): update untun to 0.2.2, which drops its three transitive dependencies
- chore(deps): dependency updates

## v2.1.1 (2026-07-18)

### Changed

- chore(deps): update dependencies
- chore: add .idea to .gitignore
- chore(github): align workflows, funding and issue templates with the other org plugins
- chore: align npm publishing files with the other org plugins
- chore: standardise the eslint setup with the other org plugins
- style: apply the standardised lint rules
- chore: standardise the package scripts and publishing config
- chore: update the plugin metadata for the new maintainer
- docs: refresh the readme
- docs: add claude and copilot instructions files
- docs: use the standard org readme banner
- fix: keep matter display names within the 32 character limit
- chore(github): update the setup-node action to v7
- chore(deps): dependency updates

## [2.1.0](https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/releases/tag/v2.1.0) (2026-05-04)

### Enhancements
- Add Homebridge v2 Matter platform support with runtime platform selection and resilient fallback to HAP when Matter is unavailable.
- Add strict Matter-mode publishing for tunnel status accessory endpoint, while preserving HAP-mode tunnel status publishing.
- Add tunnel lifecycle status propagation to accessory state updates (HAP occupancy and Matter occupancySensing state).
- Rename platform source files to `src/Platform.HAP.ts` and `src/Platform.Matter.ts`.

### Configuration
- Simplify Matter configuration to a single `enableMatter` toggle.
- Remove redundant `preferMatter` option from config schema, types, logic, and tests.

### Dependencies
- Remove unused dependencies and devDependencies.
- Update toolchain and key packages, including Homebridge v2, TypeScript v6, Vitest v4, ESLint v10, and latest project lint/test tooling.

### Tests
- Add coverage for platform proxy fallback behavior and tunnel lifecycle callback wiring.
- Add Vitest configuration to run source tests only and exclude `dist/` test duplication.

### Documentation
- Update README and Copilot instructions to match current plugin architecture and Matter/HAP behavior.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/compare/v2.0.4...v2.1.0

## [2.0.4](https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/releases/tag/v2.0.4) (2025-09-18)

## What's Changed
* No notable changes

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/compare/v2.0.3...v2.0.4

## [2.0.3](https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/releases/tag/v2.0.3) (2025-03-04)

# *No New Releases During Lent*

### What's Changes
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/compare/v2.0.2...v2.0.3

## [2.0.2](https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/releases/tag/v2.0.2) (2025-01-25)

### What's Changes
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/compare/v2.0.1...v2.0.2

## [2.0.1](https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/releases/tag/v2.0.1) (2025-01-18)

### What's Changes
- Resolve a module missing issue.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/compare/v2.0.0...v2.0.1

## [2.0.0](https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/releases/tag/v2.0.0) (2025-01-16)

### What's Changes
- This plugins has moved to a scoped plugin under the `@homebridge-plugins` org.
  - Homebridge UI is designed to transition you to the new scoped plugin.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/compare/v1.1.2...v2.0.0

## [1.1.2](https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/releases/tag/v1.1.2) (2024-11-04)

### What's Changes
- Fix refreshRate Issue

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/compare/v1.1.1...v1.1.2

## [1.1.1](https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/releases/tag/v1.1.1) (2024-11-03)

### What's Changes
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/compare/v1.1.0...v1.1.1

## [1.1.0](https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/releases/tag/v1.1.0) (2024-09-25)

### What's Changes
- Add support for self-specified tunnel domain using the `domain` and `token` config.
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/compare/v1.0.3...v1.1.0

## [1.0.3](https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/releases/tag/v1.0.3) (2024-05-26)

### What's Changes
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/compare/v1.0.2...v1.0.3

## [1.0.2](https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/releases/tag/v1.0.2) (2024-02-13)

### What's Changes
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/compare/v1.0.1...v1.0.2

## [1.0.1](https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/releases/tag/v1.0.1) (2024-01-31)

### What's Changes
- Housekeeping and updated dependencies.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/compare/v1.0.0...v1.0.1

## [1.0.0](https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/releases/tag/v1.0.0) (2024-01-12)

### What's Changes
- Release of [homebridge-cloudflared-tunnel](https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel) which allows you to setup a cloudflare tunnel so that you can access your homebridg instance remotely.

**Full Changelog**: https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/compare/v0.1.0...v1.0.0

## [0.1.0](https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/releases/tag/v0.1.0) (2021-08-09)

### What's Changes
- Initial Release
