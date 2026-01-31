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

    const lines = [
      "! Generated by Henderson's Cisco Configuration Generator",
      '! Model: ' + getModelLabel(),
      '!',
      'hostname ' + hostname.replace(/\s/g, '-'),
      '!',
    ];

    // Security: enable secret
    if (enableSecret) {
      lines.push('enable secret 0 ' + enableSecret, '!');
    }

    // Banner
    if (loginBanner) {
      lines.push('banner login ^', loginBanner, '^', '!');
    }

    // Domain & SSH (for key gen)
    if (domainName) {
      lines.push('ip domain-name ' + domainName);
      lines.push('ip ssh version ' + sshVer);
      lines.push('crypto key generate rsa modulus 2048', '!');
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

  function validateSecurity() {
    const errors = [];
    const secret = enableSecretInput.value.trim();
    if (secret && secret.length < 8) {
      errors.push('Enable secret must be at least 8 characters.');
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
