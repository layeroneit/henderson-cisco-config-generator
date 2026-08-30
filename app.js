(function () {
  const VLAN_ID_MIN = 1;
  const VLAN_ID_MAX = 4094;

  const modelSelect = document.getElementById('model');
  const portDensityWrap = document.getElementById('port-density-wrap');
  const nimWrap = document.getElementById('nim-wrap');
  const nimSelect = document.getElementById('nim');
  const portDensitySelect = document.getElementById('port-density');
  const hostnameInput = document.getElementById('hostname');
  const vlanVoiceId = document.getElementById('vlan-voice-id');
  const vlanVoiceName = document.getElementById('vlan-voice-name');
  const vlanDataId = document.getElementById('vlan-data-id');
  const vlanDataName = document.getElementById('vlan-data-name');
  const vlanSecurityId = document.getElementById('vlan-security-id');
  const vlanSecurityName = document.getElementById('vlan-security-name');
  const vlanErrors = document.getElementById('vlan-errors');
  const portModeSelect = document.getElementById('port-mode');
  const trunkAllowedWrap = document.getElementById('trunk-allowed-wrap');
  const trunkAllowedInput = document.getElementById('trunk-allowed');
  const interfaceDescInput = document.getElementById('interface-desc');
  const interfaceOptionsWrap = document.getElementById('interface-options-wrap');
  const enableSecretInput = document.getElementById('enable-secret');
  const domainNameInput = document.getElementById('domain-name');
  const sshVersionSelect = document.getElementById('ssh-version');
  const loginBannerInput = document.getElementById('login-banner');
  const managementWrap = document.getElementById('management-wrap');
  const mgmtVlanInput = document.getElementById('mgmt-vlan');
  const mgmtIpInput = document.getElementById('mgmt-ip');
  const mgmtMaskInput = document.getElementById('mgmt-mask');
  const mgmtGatewayInput = document.getElementById('mgmt-gateway');
  const mgmtErrors = document.getElementById('mgmt-errors');
  const ntpServerInput = document.getElementById('ntp-server');
  const snmpCommunityInput = document.getElementById('snmp-community');
  const syslogServerInput = document.getElementById('syslog-server');
  const aclNameInput = document.getElementById('acl-name');
  const aclLinesInput = document.getElementById('acl-lines');
  const generateBtn = document.getElementById('generate');
  const copyBtn = document.getElementById('copy');
  const downloadBtn = document.getElementById('download');
  const downloadCfgBtn = document.getElementById('download-cfg');
  const outputWrap = document.getElementById('output-wrap');
  const outputPre = document.getElementById('output');
  const sshUserInput = document.getElementById('ssh-user');
  const sshUserPassInput = document.getElementById('ssh-user-pass');
  const hardenInput = document.getElementById('harden');
  const summaryList = document.getElementById('summary-list');
  const summaryWrap = document.getElementById('summary-wrap');
  const presetButtons = document.querySelectorAll('[data-preset]');
  const uplinkPortsInput = document.getElementById('uplink-ports');
  const wipeBtn = document.getElementById('wipe');
  const clipNote = document.getElementById('clip-note');
  const verifyList = document.getElementById('verify-list');
  const verifyWrap = document.getElementById('verify-wrap');

  const ROUTER_VALUES = ['isr4321', 'isr4331', 'isr4351'];

  function isRouter() {
    return ROUTER_VALUES.includes(modelSelect.value);
  }

  function toggleNimAndPortDensity() {
    if (isRouter()) {
      nimWrap.classList.remove('hidden');
      portDensityWrap.classList.add('hidden');
      interfaceOptionsWrap.classList.add('hidden');
      managementWrap.classList.add('hidden');
    } else {
      nimWrap.classList.add('hidden');
      portDensityWrap.classList.remove('hidden');
      interfaceOptionsWrap.classList.remove('hidden');
      managementWrap.classList.remove('hidden');
    }
  }

  function toggleTrunkAllowed() {
    if (portModeSelect.value === 'trunk') {
      trunkAllowedWrap.classList.remove('hidden');
    } else {
      trunkAllowedWrap.classList.add('hidden');
    }
  }

  modelSelect.addEventListener('change', toggleNimAndPortDensity);
  portModeSelect.addEventListener('change', toggleTrunkAllowed);

  // Collapsible panels
  document.querySelectorAll('.collapse-trigger').forEach(function (el) {
    el.addEventListener('click', function () {
      var targetId = el.getAttribute('data-target');
      var panel = document.getElementById(targetId);
      var icon = el.querySelector('.collapse-icon');
      if (panel.classList.contains('open')) {
        panel.classList.remove('open');
        if (icon) icon.textContent = '▼';
      } else {
        panel.classList.add('open');
        if (icon) icon.textContent = '▲';
      }
    });
  });

  /** 1002-1005 are reserved for FDDI/Token Ring and cannot be created. */
  function isReservedVlan(n) {
    return n >= 1002 && n <= 1005;
  }

  function validateVlanId(value, label) {
    const num = parseInt(value, 10);
    if (value === '' || isNaN(num)) return { ok: true };
    if (num < VLAN_ID_MIN || num > VLAN_ID_MAX) {
      return { ok: false, msg: label + ' VLAN ID must be ' + VLAN_ID_MIN + '–' + VLAN_ID_MAX + '.' };
    }
    if (isReservedVlan(num)) {
      return { ok: false, msg: label + ' VLAN ' + num + ' is reserved (1002–1005 are FDDI and Token Ring) and cannot be created.' };
    }
    return { ok: true };
  }

  function validateVlans() {
    const errors = [];
    const voice = validateVlanId(vlanVoiceId.value.trim(), 'Voice');
    const data = validateVlanId(vlanDataId.value.trim(), 'Data');
    const security = validateVlanId(vlanSecurityId.value.trim(), 'Security');
    if (!voice.ok) errors.push(voice.msg);
    if (!data.ok) errors.push(data.msg);
    if (!security.ok) errors.push(security.msg);
    return errors;
  }

  const IPV4_REGEX = /^(?:\d{1,3}\.){3}\d{1,3}$/;
  function isValidIPv4(s) {
    if (!s || !IPV4_REGEX.test(s)) return false;
    return s.split('.').every(function (oct) {
      var n = parseInt(oct, 10);
      return n >= 0 && n <= 255;
    });
  }

  function validateManagement() {
    const errors = [];
    const vlan = mgmtVlanInput.value.trim();
    const ip = mgmtIpInput.value.trim();
    const mask = mgmtMaskInput.value.trim();
    const gw = mgmtGatewayInput.value.trim();
    if (vlan !== '') {
      const n = parseInt(vlan, 10);
      if (isNaN(n) || n < VLAN_ID_MIN || n > VLAN_ID_MAX) {
        errors.push('Management VLAN ID must be 1–4094.');
      }
    }
    if (ip !== '' && !isValidIPv4(ip)) errors.push('Management IP must be a valid IPv4 address.');
    if (mask !== '' && !isValidIPv4(mask)) errors.push('Subnet mask must be a valid IPv4 address.');
    if (gw !== '' && !isValidIPv4(gw)) errors.push('Default gateway must be a valid IPv4 address.');
    return errors;
  }

  function getInterfaceRange() {
    const n = parseInt(portDensitySelect.value, 10) || 48;
    if (n <= 8) return 'GigabitEthernet1/0/1 - 8';
    if (n <= 24) return 'GigabitEthernet1/0/1 - 24';
    return 'GigabitEthernet1/0/1 - 48';
  }

  function getModelLabel() {
    const o = modelSelect.selectedOptions[0];
    return o ? o.text : 'Switch';
  }

  function escapeBanner(text) {
    return (text || '').trim().replace(/\r?\n/g, ' ');
  }

  function buildConfig() {
    const hostname = hostnameInput.value.trim() || 'SWITCH';
    const voiceId = vlanVoiceId.value.trim();
    const voiceName = vlanVoiceName.value.trim() || 'VOICE';
    const dataId = vlanDataId.value.trim();
    const dataName = vlanDataName.value.trim() || 'DATA';
    const securityId = vlanSecurityId.value.trim();
    const securityName = vlanSecurityName.value.trim() || 'MGMT';
    const enableSecret = enableSecretInput.value.trim();
    const domainName = domainNameInput.value.trim();
    const sshVer = sshVersionSelect.value;
    const loginBanner = escapeBanner(loginBannerInput.value);
    const mgmtVlan = mgmtVlanInput.value.trim();
    const mgmtIp = mgmtIpInput.value.trim();
    const mgmtMask = mgmtMaskInput.value.trim();
    const mgmtGateway = mgmtGatewayInput.value.trim();
    const ntpServers = ntpServerInput.value.trim().split(/\s*,\s*|\s+/).filter(Boolean);
    const snmpCommunity = snmpCommunityInput.value.trim();
    const syslogServer = syslogServerInput.value.trim();
    const aclName = aclNameInput.value.trim();
    const aclLines = aclLinesInput.value.trim().split(/\n/).map(function (s) { return s.trim(); }).filter(Boolean);
    const portMode = portModeSelect.value;
    const trunkAllowed = trunkAllowedInput.value.trim();
    const ifDesc = interfaceDescInput.value.trim();
    const sshUser = sshUserInput.value.trim();
    const sshUserPass = sshUserPassInput.value.trim();
    const harden = hardenInput.checked;
    const uplinkPorts = uplinkPortsInput.value.trim();

    const lines = [
      "! Generated by Henderson's Cisco Configuration Generator",
      '! Model: ' + getModelLabel(),
      '!',
      'hostname ' + hostname.replace(/\s/g, '-'),
      '!',
    ];

    // Security: enable secret.
    // `enable secret 0 X` means "X is plaintext, hash it on entry". The DEVICE
    // stores a hash, but this generated FILE contains the password in the
    // clear, and people save and email these files. Say so in the file.
    if (enableSecret) {
      lines.push(
        '! WARNING: the next line contains a password in plain text.',
        '! The switch hashes it on entry, but this FILE does not. Do not email,',
        '! commit, or leave this file lying around after you have applied it.',
        'enable secret 0 ' + enableSecret,
        '!'
      );
    }

    // Sensible defaults a beginner would not know to ask for.
    if (harden) {
      lines.push(
        '! Baseline hardening',
        'service password-encryption',
        'no ip http server',
        'no ip http secure-server',
        '!'
      );
    }

    // Banner
    if (loginBanner) {
      lines.push('banner login ^', loginBanner, '^', '!');
    }

    // Domain & SSH.
    //
    // Generating a key is not the same as being able to log in. Without a
    // local account and a vty line that accepts SSH, this config produces a
    // device you cannot reach remotely -- which a beginner discovers after
    // the reload, from the wrong side of the room.
    //
    // Three ordering rules, all of which the earlier version got wrong:
    //   * `ip domain name` is two words on IOS-XE, not `ip domain-name`.
    //   * The key must exist BEFORE `ip ssh version 2`.
    //   * `crypto key generate rsa` is NOT a configuration command. It is
    //     never saved to the config, it prompts, and if a key already exists
    //     it asks a yes/no question that eats the next line of your paste.
    //     It is emitted as a separate step below, not inline here.
    if (domainName) {
      lines.push('ip domain name ' + domainName);
      if (sshUser && sshUserPass) {
        lines.push(
          '! Local account used to log in over SSH.',
          '! algorithm-type sha256 stores this as a type 8 hash (PBKDF2).',
          '! Cisco recommends type 8 over the older type 5; the plain-text',
          '! caveat about THIS FILE still applies.',
          'username ' + sshUser + ' privilege 15 algorithm-type sha256 secret ' + sshUserPass,
          '!',
          'line vty 0 15',
          ' login local',
          ' transport input ssh',
          ' exec-timeout 10 0',
          '!'
        );
      } else {
        lines.push(
          '! NOTE: SSH keys are generated above, but no local username was',
          '! given, so nothing here lets you actually log in. Add a username',
          '! and password in the Security section, or you will be locked out',
          '! of remote access after applying this.',
          '!'
        );
      }
    }

    // VLANs
    lines.push('! VLANs');
    if (voiceId) { lines.push('vlan ' + voiceId, ' name ' + voiceName, '!'); }
    if (dataId) { lines.push('vlan ' + dataId, ' name ' + dataName, '!'); }
    if (securityId) { lines.push('vlan ' + securityId, ' name ' + securityName, '!'); }
    if (mgmtVlan && mgmtVlan !== securityId) {
      lines.push('vlan ' + mgmtVlan, ' name MANAGEMENT', '!');
    }

    if (!isRouter()) {
      const range = getInterfaceRange();
      // THE most dangerous thing this tool can do: apply access mode and BPDU
      // guard to every port, including the one carrying the uplink to the
      // rest of the network. Over SSH that sets the uplink to access mode and
      // then err-disables it on the first BPDU from the core -- the switch and
      // everything behind it drop off, and you are not in the room.
      if (uplinkPorts) {
        lines.push(
          '!',
          '! Uplink ports (' + uplinkPorts + ') are deliberately left alone by the',
          '! block below. Configure them yourself once you can still reach the switch.'
        );
      } else if (harden) {
        lines.push(
          '!',
          '! WARNING: this applies access mode and BPDU guard to EVERY port in',
          '! ' + range + ', including whichever one is your uplink. If you are',
          '! connected over the network, that will disconnect you and shut the',
          '! uplink down. Name your uplink port in the Interfaces section, or',
          '! apply this from the console.'
        );
      }
      lines.push('!', 'interface range ' + range);
      if (portMode === 'trunk') {
        lines.push(' switchport mode trunk');
        if (trunkAllowed) lines.push(' switchport trunk allowed vlan ' + trunkAllowed);
      } else {
        lines.push(' switchport mode access');
        if (dataId) lines.push(' switchport access vlan ' + dataId);
        if (voiceId) lines.push(' switchport voice vlan ' + voiceId);
        if (harden) {
          // Access ports face desks. Portfast skips the listening/learning
          // delay so a PC gets a link immediately; BPDU guard shuts the port
          // if somebody plugs a switch into it, which is the single most
          // common way a small network takes itself down.
          //
          // `spanning-tree portfast`, NOT `portfast edge`. On Catalyst 9000
          // the `edge` keyword only exists once Bridge Assurance is enabled,
          // and emitting it otherwise is a syntax error.
          lines.push(' spanning-tree portfast', ' spanning-tree bpduguard enable');
        }
      }
      if (ifDesc) lines.push(' description ' + ifDesc);
      lines.push('!');

      // Management VLAN SVI
      if (mgmtVlan && mgmtIp && mgmtMask) {
        lines.push('interface Vlan' + mgmtVlan);
        lines.push(' ip address ' + mgmtIp + ' ' + mgmtMask);
        lines.push(' no shutdown', '!');
        if (mgmtGateway) lines.push('ip default-gateway ' + mgmtGateway, '!');
      }
    } else {
      // These platforms have NO FastEthernet interfaces at all, and an FXS
      // port is an analog voice port, not an Ethernet one. The previous
      // version emitted `interface FastEthernet0/1/0`, which simply fails.
      lines.push('!', '! Router base interfaces (onboard ports are Layer 3, no switchport)');
      lines.push('interface GigabitEthernet0/0/0', ' description WAN or uplink', ' no shutdown', '!');
      if (nimSelect.value === 't1e1') {
        lines.push(
          '! A T1/E1 NIM is not an Ethernet interface. Set the card type first,',
          '! then the controller creates the serial interface:',
          '!   card type t1 0 1',
          '!   controller T1 0/1/0',
          '!    channel-group 0 timeslots 1-24',
          '!   interface Serial0/1/0:0',
          '!'
        );
      }
      if (nimSelect.value === 'fxs') {
        lines.push(
          '! An FXS NIM provides analog voice ports, not Ethernet. They are',
          '! configured as voice-ports, not interfaces:',
          '!   voice-port 0/1/0',
          '!'
        );
      }
    }

    // NTP
    ntpServers.forEach(function (s) {
      if (s) lines.push('ntp server ' + s);
    });
    if (ntpServers.length) lines.push('!');

    // SNMP
    if (snmpCommunity) {
      lines.push('snmp-server community ' + snmpCommunity + ' RO', '!');
    }

    // Logging
    if (syslogServer) {
      lines.push('logging host ' + syslogServer);
      lines.push('logging trap informational', '!');
    }

    // ACL
    if (aclName && aclLines.length > 0) {
      // Numbered ACLs are not all standard. 1-99 and 1300-1999 are standard;
      // 100-199 and 2000-2699 are extended. Sending 100 to `standard` is
      // rejected by the device, and `permit ip any any` is extended syntax
      // that a standard list would refuse anyway.
      var isNum = /^\d+$/.test(aclName);
      var n = isNum ? parseInt(aclName, 10) : 0;
      var isStandardNum = isNum && ((n >= 1 && n <= 99) || (n >= 1300 && n <= 1999));
      var isExtendedNum = isNum && ((n >= 100 && n <= 199) || (n >= 2000 && n <= 2699));
      if (isNum && !isStandardNum && !isExtendedNum) {
        lines.push('! WARNING: ' + aclName + ' is not a valid ACL number. Standard is',
                   '! 1-99 or 1300-1999; extended is 100-199 or 2000-2699.');
      }
      if (isStandardNum) {
        lines.push('ip access-list standard ' + aclName);
      } else {
        lines.push('ip access-list extended ' + aclName);
      }
      aclLines.forEach(function (line) {
        lines.push(' ' + line);
      });
      lines.push('!');
    }

    lines.push('end');

    // Emitted AFTER `end` on purpose. These are privileged-EXEC commands that
    // prompt; they cannot be part of the configuration paste above.
    if (domainName) {
      lines.push(
        '!',
        '! ====================================================================',
        '! RUN THESE SEPARATELY, one at a time, from the enable prompt (not in',
        '! configuration mode). The key command asks a question, and pasting it',
        '! inside a block means the next line answers that question instead.',
        '! ====================================================================',
        '!   crypto key generate rsa general-keys label SSH-KEY modulus 2048',
        '!   configure terminal',
        '!    ip ssh rsa keypair-name SSH-KEY',
        '!    ip ssh version ' + sshVer,
        '!   end',
        '!   copy running-config startup-config'
      );
    }
    return lines.join('\n');
  }

  /**
   * Says what the config will DO, in words, before anyone reads Cisco syntax.
   * The point is that a beginner can check the intent even when they cannot
   * yet check the commands.
   */
  function buildSummary() {
    const out = [];
    const isR = isRouter();
    out.push('Configures a ' + getModelLabel() + ' named "' +
      (hostnameInput.value.trim() || 'SWITCH').replace(/\s/g, '-') + '".');

    const vlans = [];
    if (vlanVoiceId.value.trim()) vlans.push('VLAN ' + vlanVoiceId.value.trim() + ' (' + (vlanVoiceName.value.trim() || 'VOICE') + ')');
    if (vlanDataId.value.trim()) vlans.push('VLAN ' + vlanDataId.value.trim() + ' (' + (vlanDataName.value.trim() || 'DATA') + ')');
    if (vlanSecurityId.value.trim()) vlans.push('VLAN ' + vlanSecurityId.value.trim() + ' (' + (vlanSecurityName.value.trim() || 'MGMT') + ')');
    if (vlans.length) out.push('Creates ' + vlans.length + ' VLAN' + (vlans.length > 1 ? 's' : '') + ': ' + vlans.join(', ') + '.');

    if (!isR) {
      const range = getInterfaceRange();
      if (portModeSelect.value === 'trunk') {
        out.push('Sets ' + range + ' to trunk mode' +
          (trunkAllowedInput.value.trim() ? ', allowing VLANs ' + trunkAllowedInput.value.trim() : '') + '.');
      } else {
        out.push('Sets ' + range + ' to access mode' +
          (vlanDataId.value.trim() ? ' on VLAN ' + vlanDataId.value.trim() : '') + '.');
      }
    }

    if (mgmtVlanInput.value.trim() && mgmtIpInput.value.trim()) {
      out.push('Gives the switch the management address ' + mgmtIpInput.value.trim() +
        ' on VLAN ' + mgmtVlanInput.value.trim() + '.');
    }

    if (domainNameInput.value.trim()) {
      if (sshUserInput.value.trim() && sshUserPassInput.value.trim()) {
        out.push('Enables SSH v' + sshVersionSelect.value + ' and creates the login "' +
          sshUserInput.value.trim() + '" so you can reach it remotely.');
      } else {
        out.push('WARNING: enables SSH but creates no login, so you will NOT be able to connect remotely.');
      }
    }

    if (hardenInput.checked) {
      out.push('Applies baseline hardening: encrypts stored passwords, turns off the web server' +
        (isR ? '' : ', and protects access ports with portfast and BPDU guard') + '.');
    }

    if (enableSecretInput.value.trim()) {
      out.push('CAUTION: your passwords appear in plain text in the generated file. Delete the file once applied.');
    }
    return out;
  }

  function renderSummary() {
    const items = buildSummary();
    summaryList.innerHTML = '';
    items.forEach(function (t) {
      const li = document.createElement('li');
      if (t.indexOf('WARNING') === 0 || t.indexOf('CAUTION') === 0) li.className = 'summary-warn';
      li.textContent = t;
      summaryList.appendChild(li);
    });
    summaryWrap.classList.remove('hidden');
  }

  /** One-click starting points, so nobody faces twenty empty fields. */
  const PRESETS = {
    'access-switch': {
      model: 'c9200', 'port-density': '24', hostname: 'SW-ACCESS-01',
      'vlan-data-id': '20', 'vlan-data-name': 'DATA',
      'vlan-security-id': '99', 'vlan-security-name': 'MGMT',
      'port-mode': 'access', 'domain-name': 'company.local',
      'mgmt-vlan': '99', 'mgmt-ip': '192.168.99.10', 'mgmt-mask': '255.255.255.0',
      'mgmt-gateway': '192.168.99.1', 'ssh-user': 'netadmin',
    },
    'voice-switch': {
      model: 'c9300', 'port-density': '48', hostname: 'SW-VOICE-01',
      'vlan-voice-id': '10', 'vlan-voice-name': 'VOICE',
      'vlan-data-id': '20', 'vlan-data-name': 'DATA',
      'vlan-security-id': '99', 'vlan-security-name': 'MGMT',
      'port-mode': 'access', 'domain-name': 'company.local',
      'mgmt-vlan': '99', 'mgmt-ip': '192.168.99.11', 'mgmt-mask': '255.255.255.0',
      'mgmt-gateway': '192.168.99.1', 'ssh-user': 'netadmin',
    },
    'branch-router': {
      model: 'isr4331', hostname: 'RTR-BRANCH-01',
      'domain-name': 'company.local', 'ssh-user': 'netadmin',
      'ntp-server': '192.168.99.1',
    },
  };

  function applyPreset(name) {
    const preset = PRESETS[name];
    if (!preset) return;
    Object.keys(preset).forEach(function (id) {
      const el = document.getElementById(id);
      if (el) {
        el.value = preset[id];
        el.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    hardenInput.checked = true;
    // Passwords are never preset -- a shipped default password is how a
    // starting point becomes a production credential.
    sshUserPassInput.focus();
  }

  presetButtons.forEach(function (btn) {
    btn.addEventListener('click', function () { applyPreset(btn.getAttribute('data-preset')); });
  });

  /* -------------------------------------------------------------------------
     Syntax highlighting.

     The output is the part people actually read, and until now every line of
     it was the same shade of grey -- including the warning saying the file
     holds a password in plain text. Colour is not decoration here; it is what
     makes that line get read instead of scrolled past.

     The highlighted copy is display-only. Copy and Download always use the
     plain string, so nothing markup-ish can ever reach a switch.
     ---------------------------------------------------------------------- */

  function escapeHtml(t) {
    return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  /** Words that begin a line and are worth reading as "this is an instruction". */
  const KEYWORDS = /^(hostname|enable|service|no|ip|ipv6|vlan|interface|switchport|spanning-tree|username|line|login|transport|exec-timeout|crypto|banner|ntp|snmp-server|logging|end|name|description|shutdown|duplex|speed|channel-group)\b/;

  function highlight(config) {
    return config.split('\n').map(function (raw) {
      const line = escapeHtml(raw);

      // Warnings have to survive a skim. They are the reason this exists.
      if (/^!\s*(WARNING|CAUTION|NOTE)/i.test(raw)) {
        return '<span class="tok-warn">' + line + '</span>';
      }
      if (raw.trim() === '!' || raw.trim().charAt(0) === '!') {
        return '<span class="tok-comment">' + line + '</span>';
      }

      const indent = line.match(/^\s*/)[0];
      const body = line.slice(indent.length);
      const m = body.match(KEYWORDS);
      if (!m) return line;

      const kw = m[0];
      let rest = body.slice(kw.length);

      // Anything that looks like an address, a VLAN id, or an interface range
      // is the bit someone double-checks against their own network.
      rest = rest.replace(/(\d{1,3}(?:\.\d{1,3}){3})/g, '<span class="tok-ip">$1</span>');
      rest = rest.replace(/(\b(?:Gigabit|TenGigabit|FastEthernet|Ethernet|Vlan)\S*)/g, '<span class="tok-intf">$1</span>');
      rest = rest.replace(/(^|\s)(\d+(?:-\d+)?)(?=\s|$)/g, '$1<span class="tok-num">$2</span>');

      return indent + '<span class="tok-cmd">' + kw + '</span>' + rest;
    }).join('\n');
  }

  /* -------------------------------------------------------------------------
     "Now check it worked."

     A beginner applies a config and has no idea whether it took. These are the
     commands that answer that, chosen from what was actually configured, plus
     the one everybody forgets.
     ---------------------------------------------------------------------- */
  function buildVerify() {
    const out = [];
    const isR = isRouter();
    out.push(['show running-config', 'What the device is running right now.']);
    if (!isR && (vlanVoiceId.value.trim() || vlanDataId.value.trim() || vlanSecurityId.value.trim())) {
      out.push(['show vlan brief', 'Lists your VLANs. If one is missing, it did not apply.']);
    }
    if (!isR) {
      if (portModeSelect.value === 'trunk') {
        out.push(['show interfaces trunk', 'Confirms the trunk came up and which VLANs cross it.']);
      } else {
        out.push(['show interfaces status', 'Shows which ports are up and what VLAN each is in.']);
      }
    }
    out.push(['show ip interface brief', 'Every interface and its address. "up/up" is what you want.']);
    if (mgmtIpInput.value.trim()) {
      out.push(['show ip interface brief | include Vlan', 'Checks the management address specifically.']);
    }
    if (mgmtGatewayInput.value.trim()) {
      out.push(['ping ' + mgmtGatewayInput.value.trim(), 'Can the device reach its gateway? Five exclamation marks means yes.']);
    }
    if (domainNameInput.value.trim()) {
      out.push(['show ip ssh', 'Confirms SSH is enabled and which version.']);
      if (sshUserInput.value.trim()) {
        out.push(['show running-config | include username', 'Confirms your login account exists.']);
      }
    }
    if (ntpServerInput.value.trim()) {
      out.push(['show ntp status', 'Clock synchronised? Logs are useless with the wrong time.']);
    }
    if (aclNameInput.value.trim()) {
      out.push(['show access-lists', 'Your ACL and how many packets have matched it.']);
    }
    out.push(['copy running-config startup-config',
      'SAVE IT. Everything above is lost on the next reboot until you run this.']);
    return out;
  }

  function renderVerify() {
    const items = buildVerify();
    verifyList.innerHTML = '';
    items.forEach(function (pair) {
      const li = document.createElement('li');
      const code = document.createElement('code');
      code.textContent = pair[0];
      const span = document.createElement('span');
      span.className = 'verify-why';
      span.textContent = pair[1];
      if (pair[0].indexOf('copy running-config') === 0) li.className = 'verify-save';
      li.appendChild(code);
      li.appendChild(span);
      verifyList.appendChild(li);
    });
    verifyWrap.classList.remove('hidden');
  }

  function validateSecurity() {
    const errors = [];
    const secret = enableSecretInput.value.trim();
    if (secret && secret.length < 8) {
      errors.push('Enable secret must be at least 8 characters.');
    }
    const userPass = sshUserPassInput.value.trim();
    if (sshUserInput.value.trim() && !userPass) {
      errors.push('You gave an SSH username but no password for it.');
    }
    if (userPass && userPass.length < 8) {
      errors.push('The SSH account password must be at least 8 characters.');
    }
    if (userPass && !sshUserInput.value.trim()) {
      errors.push('You gave an SSH password but no username for it.');
    }
    return errors;
  }

  function runGenerate() {
    vlanErrors.classList.add('hidden');
    vlanErrors.textContent = '';
    mgmtErrors.classList.add('hidden');
    mgmtErrors.textContent = '';

    const secErrs = validateSecurity();
    if (secErrs.length > 0) {
      vlanErrors.textContent = secErrs.join(' ');
      vlanErrors.classList.remove('hidden');
      return;
    }

    const vlanErrs = validateVlans();
    if (vlanErrs.length > 0) {
      vlanErrors.textContent = vlanErrs.join(' ');
      vlanErrors.classList.remove('hidden');
      return;
    }

    if (!isRouter()) {
      const mgmtErrs = validateManagement();
      if (mgmtErrs.length > 0) {
        mgmtErrors.textContent = mgmtErrs.join(' ');
        mgmtErrors.classList.remove('hidden');
        return;
      }
    }

    const config = buildConfig();
    // Display gets the highlighted copy; `data-plain` is what Copy and
    // Download read, so no markup can ever reach a switch.
    outputPre.innerHTML = highlight(config);
    outputPre.setAttribute('data-plain', config);
    // Plain English first, Cisco syntax second, then how to check it worked.
    renderSummary();
    renderVerify();
    outputWrap.classList.remove('hidden');
    copyBtn.disabled = false;
    downloadBtn.disabled = false;
  }

  generateBtn.addEventListener('click', runGenerate);

  copyBtn.addEventListener('click', function () {
    const text = outputPre.getAttribute('data-plain') || outputPre.textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(
      function () {
        armClipboardClear(90);
        var span = document.createElement('span');
        span.className = 'copy-feedback';
        span.textContent = 'Copied!';
        copyBtn.after(span);
        setTimeout(function () { span.remove(); }, 2000);
      },
      function () {
        alert('Copy failed. Select the text and copy manually.');
      }
    );
  });

  /**
   * `.txt` opens anywhere with a double-click. `.cfg` is what network tooling
   * and the VS Code Cisco syntax extensions bind to, so it arrives coloured
   * instead of grey. Same bytes either way -- only the extension differs.
   */
  function downloadConfig(ext) {
    const text = outputPre.getAttribute('data-plain') || outputPre.textContent;
    if (!text) return;
    const hostname = hostnameInput.value.trim() || 'switch';
    const safe = hostname.replace(/\s/g, '-').replace(/[^\w\-]/g, '');
    const filename = (safe || 'config') + '-config.' + ext;
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  downloadBtn.addEventListener('click', function () { downloadConfig('txt'); });
  if (downloadCfgBtn) downloadCfgBtn.addEventListener('click', function () { downloadConfig('cfg'); });

  /* -------------------------------------------------------------------------
     Data hygiene.

     This tool handles passwords that end up in a file people save and email.
     What follows is what a page can honestly do about that -- and the README
     says plainly what it cannot.
     ---------------------------------------------------------------------- */

  /** Empties the secret fields and the rendered config. */
  function wipeSecrets() {
    [enableSecretInput, sshUserPassInput].forEach(function (el) {
      el.value = '';
    });
    outputPre.textContent = '';
    outputPre.removeAttribute('data-plain');
    outputWrap.classList.add('hidden');
    summaryWrap.classList.add('hidden');
    verifyWrap.classList.add('hidden');
    copyBtn.disabled = true;
    downloadBtn.disabled = true;
    if (downloadCfgBtn) downloadCfgBtn.disabled = true;
    if (clipNote) clipNote.textContent = '';
    enableSecretInput.focus();
  }

  if (wipeBtn) wipeBtn.addEventListener('click', wipeSecrets);

  /*
    Windows keeps a clipboard HISTORY (Win+V), and a web page cannot opt out of
    it -- the format that suppresses it is a native clipboard format no browser
    exposes. So the honest thing is to overwrite the clipboard after a while
    and say so, rather than imply the copy was private.
  */
  var clipTimer = null;
  function armClipboardClear(seconds) {
    if (!clipNote) return;
    if (clipTimer) clearTimeout(clipTimer);
    var left = seconds;
    var tick = function () {
      clipNote.textContent = 'Clipboard will be overwritten in ' + left + 's. ' +
        'Note: Windows clipboard history (Win+V) keeps its own copy that no web page can remove.';
      if (left <= 0) {
        navigator.clipboard.writeText(' ').catch(function () { /* focus lost; nothing to do */ });
        clipNote.textContent = 'Clipboard overwritten. Windows clipboard history (Win+V) may still hold the earlier copy.';
        return;
      }
      left -= 1;
      clipTimer = setTimeout(tick, 1000);
    };
    tick();
  }

  toggleNimAndPortDensity();
  toggleTrunkAllowed();
})();
