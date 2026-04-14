# Copilot Instructions for Homebridge Cloudflared Tunnel

## Project Overview

This is a Homebridge plugin that enables users to create Cloudflared tunnels for exposing their Homebridge instance for remote access. The plugin integrates with Cloudflare's tunnel service to provide secure remote connectivity.

## Matter and HomeKit Integration

### Matter Implementation
The plugin implements runtime platform selection with strict mode-specific publishing:
- **HAP mode** (HomeKit Accessory Protocol): Base implementation via `CloudflaredTunnelPlatform` in `src/Platform.HAP.ts`.
- **Matter mode**: Extended implementation via `CloudflaredTunnelMatterPlatform` in `src/Platform.Matter.ts`.

Selection is performed by `createPlatformProxy()` in `src/utils.ts`, based on `enableMatter` and Homebridge Matter runtime availability.

In Matter mode, the plugin publishes a Matter accessory endpoint for tunnel status and does not publish the HAP status accessory. If Matter initialization fails, the proxy falls back to HAP mode.

### Matter Device Type Mapping
The current implementation publishes tunnel status as:

| Mode | Device/Service | Type | Cluster/Characteristic |
|---|---|---|---|
| HAP | Tunnel Status | `OccupancySensor` | `OccupancyDetected` |
| Matter | Tunnel Status | `MotionSensor` | `occupancySensing.occupancy.occupied` |

### Authoritative Matter References

1. https://matter-js.github.io/docs/index.html
2. https://github.com/homebridge-plugins/homebridge-matter: Official Homebridge Matter plugin repository with extensive documentation and examples
  - For all Matter cluster, attribute, and device type specifications, use the official homebridge-matter wiki:
    - [Introduction](https://github.com/homebridge-plugins/homebridge-matter/wiki/Introduction)
    - [Core Concepts](https://github.com/homebridge-plugins/homebridge-matter/wiki/Core-Concepts)
    - [Getting Started](https://github.com/homebridge-plugins/homebridge-matter/wiki/Getting-Started)
    - [State Management](https://github.com/homebridge-plugins/homebridge-matter/wiki/State-Management)
    - [Monitoring External Changes](https://github.com/homebridge-plugins/homebridge-matter/wiki/Monitoring-External-Changes)
    - [Best Practices](https://github.com/homebridge-plugins/homebridge-matter/wiki/Best-Practices)
    - [Advanced Patterns](https://github.com/homebridge-plugins/homebridge-matter/wiki/Advanced-Patterns)
    - [API Reference](https://github.com/homebridge-plugins/homebridge-matter/wiki/API-Reference)
    - [Matter Types](https://github.com/homebridge-plugins/homebridge-matter/wiki/Matter-Types)
    - [Value Conversions](https://github.com/homebridge-plugins/homebridge-matter/wiki/Value-Conversions)

  - **Device References:**
    - [Lighting Devices (§4)](https://github.com/homebridge-plugins/homebridge-matter/wiki/Section-4-Lighting) — DimmableLight, OnOffLight
    - [Switches (§6)](https://github.com/homebridge-plugins/homebridge-matter/wiki/Section-6-Switches) — OnOffSwitch
    - [Sensors (§7)](https://github.com/homebridge-plugins/homebridge-matter/wiki/Section-7-Sensors) — OccupancySensor
    - [Closure Devices (§8)](https://github.com/homebridge-plugins/homebridge-matter/wiki/Section-8-Closure) — WindowCovering

## Changelog Format Requirements

When generating a changelog release entry, always use this exact structure:

1. Release header with compare URL using `compare/tag/vX.Y.Z`:

```md
## [X.Y.Z](https://github.com/homebridge-plugins/homebridge-updater/compare/tag/vX.Y.Z) (YYYY-MM-DD)
```

2. Standard sections as needed (`### Bug Fixes`, `### Enhancements`, `### Documentation`, etc.).

3. End each release entry with a full changelog comparison URL to the previous version:

```md
**Full Changelog**: https://github.com/homebridge-plugins/homebridge-updater/compare/vX.Y.(Z-1)...vX.Y.Z
```

Do not omit either URL line when creating a new release entry.

## Architecture and Structure

### Core Components
- **HAP Platform (`src/Platform.HAP.ts`)**: Main platform class implementing `DynamicPlatformPlugin`
- **Matter Platform (`src/Platform.Matter.ts`)**: Matter-specific extension with Matter accessory registration and state updates
- **Platform Proxy (`src/utils.ts`)**: Runtime HAP/Matter selection and fallback behavior
- **CloudflaredTunnel (`src/cloudflared-tunnel.ts`)**: Handles tunnel creation and management
- **Settings (`src/settings.ts`)**: Configuration types and constants
- **Index (`src/index.ts`)**: Plugin entry point and registration

### Key Dependencies
- `homebridge`: Core Homebridge API
- `untun`: Tunnel management library
- `command-exists`: Checks availability of the cloudflared binary in PATH
- `@homebridge/plugin-ui-utils`: Homebridge UI server utilities

## Development Standards

### TypeScript Configuration
- Target: ES2022 with bundler module resolution
- Strict mode enabled with `noImplicitAny: false`
- Source maps and declarations generated
- Files compiled from `src/` to `dist/`

### Code Style (ESLint with Antfu Config)
- Use 1TBS brace style with single-line exceptions
- Consistent quote properties (`consistent-as-needed`)
- Sorted imports with specific group ordering:
  1. Built-in types
  2. External types  
  3. Internal types
  4. Built-in modules
  5. External modules
  6. Internal modules
  7. Relative imports
- Named exports and imports must be sorted
- Multi-line curly braces required
- Import extensions required (ignoring packages)

### File Structure Conventions
- TypeScript source files in `src/`
- Test files end with `.test.ts`
- Use `.js` extensions in import statements (for ES modules)
- Homebridge UI files in `src/homebridge-ui/`

## Testing Guidelines

### Test Framework
- **Vitest** for unit testing
- Test files: `*.test.ts` in `src/` directory
- Coverage reporting with v8
- Available scripts:
  - `npm test`: Run tests once
  - `npm run test:watch`: Watch mode
  - `npm run test-coverage`: With coverage

### Test Patterns
- Test configuration parsing and validation
- Mock external dependencies (cloudflared, untun)
- Test platform lifecycle methods
- Verify error handling and logging

## Build and Development

### Available Scripts
- `npm run build`: Clean, compile TypeScript, copy UI files
- `npm run watch`: Build + link + nodemon for development
- `npm run clean`: Remove dist directory
- `npm run lint`: Run ESLint
- `npm run lint:fix`: Auto-fix ESLint issues

### Build Process
1. Clean previous build (`shx rm -rf ./dist`)
2. TypeScript compilation with source maps
3. Copy Homebridge UI files to dist
4. Generate TypeDoc documentation

## Homebridge Integration

### Plugin Registration
- Plugin name: `@homebridge-plugins/homebridge-cloudflared-tunnel`
- Platform name: `CloudflaredTunnel`
- Requires Homebridge ^2.0.0

### Configuration Schema
- Schema defined in `config.schema.json`
- Platform config type: `CloudflaredTunnelPlatformConfig`
- Support for logging levels, refresh rates, tunnel options

### Platform Implementation
- Implements `DynamicPlatformPlugin` interface
- Handles platform initialization and configuration
- Manages tunnel lifecycle (start/stop/restart)
- Provides logging and error handling
- Registers tunnel status accessory in HAP mode
- Registers Matter tunnel status endpoint in Matter mode and updates occupancy cluster state

## Cloudflare Integration

### Tunnel Management
- Uses `untun` library for tunnel operations
- Supports various tunnel providers (Cloudflare, ngrok, etc.)
- Handles tunnel URL discovery and logging
- Manages tunnel process lifecycle

### Configuration Options
- Auto-installation of cloudflared binary
- Custom tunnel configuration
- Port and protocol specification
- Authentication and security settings

## Error Handling

### Logging Patterns
- Use Homebridge logging interface (`this.log`)
- Log levels: error, warn, info, debug
- Include relevant context (tunnel URL, config, errors)
- Graceful degradation on tunnel failures

### Common Error Scenarios
- Missing cloudflared binary
- Network connectivity issues
- Invalid configuration
- Tunnel startup failures
- Port conflicts

## Documentation

### Code Documentation
- JSDoc comments for public APIs
- TypeDoc for generated documentation
- Document complex tunnel logic
- Include usage examples in comments

### User Documentation
- README with installation steps
- Configuration examples
- Troubleshooting guide
- Links to Cloudflare documentation

## Security Considerations

### Tunnel Security
- Validate tunnel URLs and certificates
- Secure credential storage
- Proper tunnel cleanup on shutdown
- Network access controls

### Code Security
- Input validation for configuration
- Sanitize external command execution
- Handle sensitive data appropriately
- Regular dependency updates

## Release and Publishing

### Version Management
- Semantic versioning (major.minor.patch)
- Changelog maintenance
- GitHub releases with release notes
- npm publishing to public registry

### Beta Branching Strategy
- **ALL pull requests must target a beta branch first**, not the main/latest branch
- Beta branches follow the pattern `beta-X.Y.Z` where X.Y.Z is the target version
- If no beta branch exists for the target version, create one based on the latest branch
- Examples: `beta-2.0.4` (patch), `beta-2.1.0` (minor), `beta-3.0.0` (major)

### Semantic Version Labels (Required)
Before assigning any issue to Copilot, one of these labels **must** be applied:
- **`patch`**: Bug fixes and small improvements (e.g., 2.0.3 → 2.0.4)
- **`minor`**: New features and functionality (e.g., 2.0.3 → 2.1.0)  
- **`major`**: Breaking changes (e.g., 2.0.3 → 3.0.0)

These labels determine:
1. Which beta branch to target (or create if needed)
2. The version increment for the release
3. The scope and impact of changes expected

### CI/CD Pipeline
- GitHub Actions for build and test
- Automated release drafting
- Dependency security scanning
- Multi-platform testing (Node 22, 24)
- Beta releases trigger automatically on pushes to beta-* branches

## When Contributing

### Prerequisites
Before starting any work:
1. **Ensure proper labels are applied**: One of `patch`, `minor`, or `major` must be set
2. **Verify target beta branch exists**: Check for `beta-X.Y.Z` branch matching the label type
3. **Create beta branch if needed**: Base it on `latest` branch for the target version

### Code Changes
- Follow existing patterns in `src/Platform.HAP.ts`, `src/Platform.Matter.ts`, and `src/utils.ts`
- Update tests for new functionality
- Ensure TypeScript strict compliance
- Add JSDoc for public methods
- **Always target beta branches first**, never directly to main/latest

### Configuration Changes
- Update config.schema.json
- Modify CloudflaredTunnelPlatformConfig type
- Test configuration validation
- Update documentation

### Dependencies
- Prefer existing ecosystem tools
- Minimize new dependencies
- Check compatibility with Homebridge versions
- Verify security and maintenance status

## Common Tasks

### Working with Beta Branches
1. **Check for existing beta branch**: `git branch -r | grep beta-`
2. **Create new beta branch if needed**:
   ```bash
   git checkout latest
   git pull origin latest
   git checkout -b beta-X.Y.Z
   git push origin beta-X.Y.Z
   ```
3. **Target the correct beta branch** based on semantic version label:
   - `patch` label → `beta-X.Y.(Z+1)` (e.g., 2.0.3 → beta-2.0.4)
   - `minor` label → `beta-X.(Y+1).0` (e.g., 2.0.3 → beta-2.1.0)
   - `major` label → `beta-(X+1).0.0` (e.g., 2.0.3 → beta-3.0.0)

### Adding New Tunnel Options
1. Update `CloudflaredTunnelPlatformConfig` interface
2. Modify config schema validation
3. Implement option handling in CloudflaredTunnel class
4. Add tests for new configuration
5. Update documentation

### Debugging Tunnel Issues
1. Enable debug logging in configuration
2. Check cloudflared binary installation
3. Verify network connectivity
4. Review tunnel startup logs
5. Test with minimal configuration

### Performance Optimization
1. Monitor tunnel startup time
2. Optimize configuration parsing
3. Implement proper cleanup
4. Consider caching strategies
5. Profile memory usage