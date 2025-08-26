# Copilot Instructions for Homebridge Cloudflared Tunnel

## Project Overview

This is a Homebridge plugin that enables users to create Cloudflared tunnels for exposing their Homebridge instance for remote access. The plugin integrates with Cloudflare's tunnel service to provide secure remote connectivity.

## Architecture and Structure

### Core Components
- **Platform (`src/platform.ts`)**: Main platform class implementing `DynamicPlatformPlugin`
- **CloudflaredTunnel (`src/cloudflared-tunnel.ts`)**: Handles tunnel creation and management
- **Settings (`src/settings.ts`)**: Configuration types and constants
- **Index (`src/index.ts`)**: Plugin entry point and registration

### Key Dependencies
- `homebridge`: Core Homebridge API
- `untun`: Tunnel management library
- `cloudflared`: Cloudflare tunnel binary interface
- `cloudflared-tunnel`: Cloudflare tunnel library

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
- Requires Homebridge ^1.9.0 || ^2.0.0

### Configuration Schema
- Schema defined in `config.schema.json`
- Platform config type: `CloudflaredTunnelPlatformConfig`
- Support for logging levels, refresh rates, tunnel options

### Platform Implementation
- Implements `DynamicPlatformPlugin` interface
- Handles platform initialization and configuration
- Manages tunnel lifecycle (start/stop/restart)
- Provides logging and error handling

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

### CI/CD Pipeline
- GitHub Actions for build and test
- Automated release drafting
- Dependency security scanning
- Multi-platform testing (Node 20, 22)

## When Contributing

### Code Changes
- Follow existing patterns in platform.ts
- Update tests for new functionality
- Ensure TypeScript strict compliance
- Add JSDoc for public methods

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