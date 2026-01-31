# Henderson's Cisco Configuration Generator

A web app that captures hardware, VLANs, security, and services to generate a standardized, copy-paste-ready Cisco IOS configuration file.

## Push to GitHub

1. Create a new repository at [github.com/new](https://github.com/new) named **henderson-cisco-config-generator** (leave it empty—no README or .gitignore).
2. Edit `push-to-github.bat` and set `GITHUB_USER` to your GitHub username.
3. Run `push-to-github.bat` to add the remote and push.

## Features

- **Hardware**: Model picker (Catalyst 9200/9300, ISR 4321/4331/4351), port density (8/24/48), optional NIM modules for routers
- **VLANs**: Voice, Data, and Security VLAN IDs and names (validation 1–4094)
- **Interface options**: Access or trunk mode; trunk allowed VLANs; optional interface description
- **Security** (collapsible): Enable secret, domain name, SSH version, login banner
- **Management** (switches, collapsible): Management VLAN, IP, subnet mask, default gateway
- **Services** (collapsible): NTP servers, SNMP community, syslog server
- **ACL** (collapsible): Optional named or numbered ACL with custom lines
- **Output**: Generate, Copy to clipboard, Download as `.txt`

## How to run

1. Open the project folder: `henderson-cisco-config-generator`
2. Double-click `index.html` or `run-app.bat`, or
3. Run a local server (e.g. `npx serve .` or `python -m http.server 8080`) and open the URL.

No build step or npm install required.

## Project structure

- `index.html` – Form and collapsible sections
- `styles.css` – Layout, collapsible panels, styling
- `app.js` – Logic, validation (VLAN, IP, enable secret), config generation, copy & download
