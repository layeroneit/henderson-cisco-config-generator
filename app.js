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
  const outputWrap = document.getElementById('output-wrap');
  const outputPre = document.getElementById('output');
  const sshUserInput = document.getElementById('ssh-user');
  const sshUserPassInput = document.getElementById('ssh-user-pass');
  const hardenInput = document.getElementById('harden');
  const summaryList = document.getElementById('summary-list');
  const summaryWrap = document.getElementById('summary-wrap');
  const presetButtons = document.querySelectorAll('[data-preset]');

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

  function validateVlanId(value, label) {
    const num = parseInt(value, 10);
    if (value === '' || isNaN(num)) return { ok: true };
    if (num < VLAN_ID_MIN || num > VLAN_ID_MAX) {
      return { ok: false, msg: label + ' VLAN ID must be ' + VLAN_ID_MIN + '–' + VLAN_ID_MAX + '.' };
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
    if (domainName) {
      lines.push('ip domain-name ' + domainName);
      lines.push('ip ssh version ' + sshVer);
      lines.push('crypto key generate rsa modulus 2048', '!');
      if (sshUser && sshUserPass) {
        lines.push(
          '! Local account used to log in over SSH',
          '! (same plain-text caveat as the enable secret above)',
          'username ' + sshUser + ' privilege 15 secret 0 ' + sshUserPass,
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
      lines.push('!', '! Router base interfaces');
      if (nimSelect.value === 't1e1') {
        lines.push('interface GigabitEthernet0/0/0', ' no shutdown', '!');
      }
      if (nimSelect.value === 'fxs') {
        lines.push('interface FastEthernet0/1/0', ' no shutdown', '!');
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
      var isNum = /^\d+$/.test(aclName);
      if (isNum) {
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
    outputPre.textContent = config;
    // Plain English first, Cisco syntax second.
    renderSummary();
    outputWrap.classList.remove('hidden');
    copyBtn.disabled = false;
    downloadBtn.disabled = false;
  }

  generateBtn.addEventListener('click', runGenerate);

  copyBtn.addEventListener('click', function () {
    const text = outputPre.textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(
      function () {
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

  downloadBtn.addEventListener('click', function () {
    const text = outputPre.textContent;
    if (!text) return;
    const hostname = hostnameInput.value.trim() || 'switch';
    const safe = hostname.replace(/\s/g, '-').replace(/[^\w\-]/g, '');
    const filename = (safe || 'config') + '-config.txt';
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  toggleNimAndPortDensity();
  toggleTrunkAllowed();
})();
