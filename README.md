# Henderson's Cisco Configuration Generator

**👉 [Open it in your browser](https://layeroneit.github.io/henderson-cisco-config-generator/) — nothing to install.**

Fill in a form, get a clean, copy-paste-ready Cisco IOS configuration. Built for
people who are learning their way around switches and routers and would rather
not retype the same forty lines for the tenth time.

It runs entirely in your browser. Nothing you type is sent anywhere — no server,
no account, no analytics. Close the tab and it's gone.

---

## ⚠️ Read this before you paste anything

This generates a **solid starting point, not a finished design.**

- **Read every line before you apply it.** You are the last check; nothing here
  can see your network.
- **Try it on a lab device or a spare port first.** Not on the switch the whole
  office is plugged into, at 4pm on a Friday.
- **The downloaded file contains your passwords in plain text.** The device
  hashes them once applied — the file does not. Delete it when you're done, and
  don't email it to yourself.
- **Applying a config remotely can lock you out.** If you're SSH'd into the
  device you're configuring, make sure you have console access before you start.

---

## Start here

1. Open the [generator](https://layeroneit.github.io/henderson-cisco-config-generator/).
2. Click a **template** — *Basic access switch*, *Voice + data switch*, or
   *Branch router* — to fill the form with sensible values.
3. Change what doesn't match your kit. Every field has a hint under it.
4. Fill in the **SSH username and password**. Skip these and you won't be able
   to log in over the network afterwards.
5. Click **Generate config**.
6. Read **"What this config does"** — it explains, in plain English, what you're
   about to apply. If that paragraph doesn't match what you wanted, fix the form
   rather than the config.
7. Copy or download, then apply it to your device.

## What it covers

| Section | What you get |
|---|---|
| **Hardware** | Catalyst 9200 / 9300 switches, ISR 4321 / 4331 / 4351 routers, 8 / 24 / 48 ports, optional NIM modules |
| **VLANs** | Voice, data and management VLANs with names, validated to the real 1–4094 range |
| **Interfaces** | Access or trunk mode, allowed VLAN lists, descriptions, voice VLAN on access ports |
| **Security** | Enable secret, SSH with a working login, domain name, login banner |
| **Hardening** | Password encryption, web server off, portfast + BPDU guard on access ports |
| **Management** | Management VLAN SVI, IP, mask, default gateway |
| **Services** | NTP, SNMP community, syslog host |
| **ACLs** | Named or numbered access lists with your own rules |

### About that hardening checkbox

It's on by default, and it's the part a beginner most benefits from:

- `service password-encryption` — stops passwords sitting in the running config
  in the clear.
- `no ip http server` / `no ip http secure-server` — turns off a web interface
  you almost certainly aren't using and don't want exposed.
- `spanning-tree portfast` + `bpduguard` on access ports — a PC gets a link
  immediately instead of waiting ~30 seconds, and if somebody plugs a switch
  into a desk port, that port shuts down instead of taking the network with it.

### About SSH

Generating an SSH key is **not** the same as being able to log in. A device
needs a key *and* an account *and* a vty line that accepts SSH. Fill in the SSH
username and password fields and you get all three. Leave them blank and the
generated config says so, loudly, in a comment.

---

## What happens to your passwords

The config this tool builds contains an enable secret and an SSH password in
plain text. Nothing you type is ever sent anywhere — there is no server — but
"stays in your browser" is not the same as "leaves no trace." Here is the
honest version.

**What the tool does about it**

- The password boxes are deliberately **not** `<input type="password">`. They are
  masked with CSS instead. A real password field triggers your browser's "save
  password?" prompt and can be written into form history; a plain field
  with `autocomplete="off"` is not managed by the password manager at all.
- **Clear passwords** empties both boxes and the generated config in one click.
- After you copy, the clipboard is **overwritten after 90 seconds**, with a
  countdown so you know.
- Nothing is written to `localStorage`, `sessionStorage`, IndexedDB, or cookies.
  Close the tab and the page is gone.

**What no web page can do, including this one**

- **Windows clipboard history.** If you press Win+V you will find the config,
  password included, and possibly synced to your Microsoft account. The
  clipboard format that suppresses this is a native one no browser exposes.
  Overwriting the clipboard does not remove earlier history entries. Clear it
  in **Settings → System → Clipboard → Clear clipboard data**, or use Download
  instead of Copy.
- **The downloaded file.** It sits in Downloads until you delete it, may be
  indexed by Windows Search, and if your Downloads or Desktop folder is synced
  by OneDrive it has already left the machine. Deleting to the Recycle Bin only
  moves it — use Shift+Delete.
- **Memory.** JavaScript strings are immutable and garbage-collected; a value
  cannot be reliably zeroed, and it may reach the page file or a crash dump.
  Full-disk encryption (BitLocker) is what actually addresses this.

**The short version:** prefer **Download** over **Copy**, delete the file once
you have applied it, and change the passwords afterwards if the machine is not
yours.

---

## Running it offline

Air-gapped, or just prefer a local copy? Grab the
[latest release](https://github.com/layeroneit/henderson-cisco-config-generator/releases),
unzip it, and double-click `index.html`. No build step, no `npm install`, no
internet. It's three files and it works the same.

## For developers

Plain HTML, CSS and JavaScript — no framework, no build.

```
index.html   the form
styles.css   layout and theme
app.js       validation, config generation, copy and download
verify.js    headless check that the generated config is actually usable
```

`node verify.js` runs `app.js` against a stub DOM and asserts the output
contains a working SSH login, the hardening lines, and the plain-text password
warning. Run it after touching `buildConfig`.

---

## License

Apache License 2.0 — see [`LICENSE`](LICENSE).

Built by **[Layer One IT Consultants](https://layeroneconsultants.com/)**.
Copyright © 2026 Layer One IT Consultants.

Cisco, Catalyst and IOS are trademarks of Cisco Systems, Inc. This project is
not affiliated with, endorsed by, or supported by Cisco.
