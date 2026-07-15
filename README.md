<span align="center">

<a href="https://github.com/homebridge/verified/blob/master/verified-plugins.json"><img alt="homebridge-verified" src="https://raw.githubusercontent.com/homebridge-plugins/homebridge-cloudflared-tunnel/latest/branding/Homebridge_x_CloudflaredTunnel.svg?sanitize=true" width="350px"></a>

# Homebridge Cloudflared Tunnel

<a href="https://www.npmjs.com/package/homebridge-cloudflared-tunnel"><img alt="badge" title="npm version" src="https://badgen.net/npm/v/homebridge-cloudflared-tunnel?icon=npm&label" ></a>
<a href="https://www.npmjs.com/package/homebridge-cloudflared-tunnel"><img alt="badge" title="npm downloads" src="https://badgen.net/npm/dt/homebridge-cloudflared-tunnel?label=downloads" ></a>
<a href="https://discord.gg/8fpZA4S"><img alt="badge" title="discord-cloudflared-tunnel" src="https://badgen.net/discord/online-members/8fpZA4S?icon=discord&label=discord" ></a>
<a href="https://paypal.me/donavanbecker"><img alt="badge" title="donate" src="https://badgen.net/badge/donate/paypal/yellow" ></a>

<p>The Homebridge <a href="https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/">Cloudflared Tunnel</a>
plugin allows you to run a Cloudflare-Tunnel for exposing your
  <a href="https://homebridge.io">Homebridge</a> instance for remote access.
</p>

</span>

## Installation

1. Search for "Cloudflared Tunnel" on the plugin screen of [Homebridge UI](https://github.com/homebridge/homebridge-config-ui-x).
2. Click **Install**.
3. Set Auto Start Tunnel Install in Plugin Configs.
4. Restart the plugin and the Cloudflare URL will be displayed in logs.

## Matter Support

This plugin supports Homebridge v2 Matter runtime selection.

- When Matter is available and enabled in Homebridge, the plugin can run in Matter mode.
- When Matter is unavailable, disabled, or initialization fails, the plugin automatically falls back to HAP mode.
- Tunnel lifecycle behavior is identical in HAP and Matter modes.
- In HAP mode, the plugin registers a tunnel status accessory as an Occupancy Sensor.
- In Matter mode, the plugin registers a Matter Motion Sensor endpoint using the occupancySensing cluster and does not publish the HAP status accessory.

### Matter Settings

- `enableMatter`: Enables Matter mode for this plugin (default: `true`).
  - `true`: Use Matter mode when Matter runtime is available.
  - `false`: Force HAP mode.
