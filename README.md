<p align="center">
   <a href="https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel"><img alt="homebridge-cloudflared-tunnel" src="https://raw.githubusercontent.com/homebridge-plugins/homebridge-cloudflared-tunnel/latest/branding/Homebridge_x_CloudflaredTunnel.png" width="600px"></a>
</p>
<span align="center">

## homebridge-cloudflared-tunnel

Homebridge plugin to expose your Homebridge instance for remote access via a Cloudflare Tunnel

[![npm](https://img.shields.io/npm/v/@homebridge-plugins/homebridge-cloudflared-tunnel/latest?label=latest)](https://www.npmjs.com/package/@homebridge-plugins/homebridge-cloudflared-tunnel)
[![npm](https://img.shields.io/npm/v/@homebridge-plugins/homebridge-cloudflared-tunnel/beta?label=beta)](https://github.com/homebridge/homebridge/wiki/How-to-Install-Alternate-Plugin-Versions)<br>
[![verified-by-homebridge](https://img.shields.io/badge/homebridge-verified-blueviolet?color=%23491F59&style=flat)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)<br>
[![npm](https://img.shields.io/npm/dt/@homebridge-plugins/homebridge-cloudflared-tunnel)](https://www.npmjs.com/package/@homebridge-plugins/homebridge-cloudflared-tunnel)
[![Discord](https://img.shields.io/discord/432663330281226270?color=728ED5&logo=discord&label=hb-discord)](https://discord.gg/bHjKNkN)

</span>

### Plugin Information

- This plugin runs a [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/) so you can access your Homebridge instance remotely. The plugin:
  - starts and supervises a `cloudflared` tunnel process alongside Homebridge
  - shows the tunnel status in HomeKit as a sensor accessory
  - can use a free quick tunnel (random URL) or your own Cloudflare domain

### Prerequisites

- To use this plugin, you will need to already have:
  - [Node](https://nodejs.org): latest version of `v22` or `v24` - any other major version is not supported.
  - [Homebridge](https://homebridge.io): `v2` - refer to link for more information and installation instructions.

### Setup

- [Installation](https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/wiki/Installation)
- [Configuration](https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/wiki/Configuration)
- [Beta Version](https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/wiki/Beta-Version)
- [Node Version](https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/wiki/Node-Version)

### Features

- **Matter** support is available when running Homebridge v2.0+ with Matter enabled:
  - `enableMatter: true` (the default) uses Matter mode when the Matter runtime is available; the tunnel status is published as a Matter motion sensor endpoint.
  - `enableMatter: false` forces HAP mode; the tunnel status is published as a HomeKit occupancy sensor.
  - Tunnel behaviour is identical in both modes, and the plugin falls back to HAP automatically if Matter is unavailable.

### Help/About

- [Common Errors](https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/wiki/Common-Errors)
- [Support Request](https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/issues/new/choose)
- [Changelog](https://github.com/homebridge-plugins/homebridge-cloudflared-tunnel/blob/latest/CHANGELOG.md)

### Credits

- To [@donavanbecker](https://github.com/donavanbecker): the original creator and maintainer of this plugin.
- To the creators/contributors of [Homebridge](https://homebridge.io) who make this plugin possible.

### Disclaimer

- I am in no way affiliated with Cloudflare and this plugin is a personal project that I maintain in my free time.
- Use this plugin entirely at your own risk - please see licence for more information.
