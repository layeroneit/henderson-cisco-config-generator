/**
 * Runs app.js against a stub DOM and asserts the generated config.
 *
 * The bug this exists to catch: the generator emitted `crypto key generate rsa`
 * but never a local account or a vty line, so the config produced a device
 * nobody could SSH into. That is invisible in a diff and obvious here.
 */
const fs = require("fs");
const vm = require("vm");

const values = {
  model: "c9200",
  "port-density": "24",
  nim: "none",
  hostname: "SW-TEST-01",
  "vlan-voice-id": "10", "vlan-voice-name": "VOICE",
  "vlan-data-id": "20", "vlan-data-name": "DATA",
  "vlan-security-id": "99", "vlan-security-name": "MGMT",
  "port-mode": "access",
  "trunk-allowed": "", "interface-desc": "Desk ports",
  "enable-secret": "SuperSecret123",
  "domain-name": "company.local",
  "ssh-version": "2",
  "ssh-user": "netadmin",
  "ssh-user-pass": "AnotherSecret123",
  "login-banner": "",
  "mgmt-vlan": "99", "mgmt-ip": "192.168.99.10",
  "mgmt-mask": "255.255.255.0", "mgmt-gateway": "192.168.99.1",
  "ntp-server": "", "snmp-community": "", "syslog-server": "",
  "acl-name": "", "acl-lines": "",
};

const handlers = {};
const nodes = {};
function node(id) {
  if (nodes[id]) return nodes[id];
  nodes[id] = {
    id,
    value: values[id] !== undefined ? values[id] : "",
    checked: id === "harden",
    textContent: "",
    innerHTML: "",
    disabled: false,
    className: "",
    classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
    style: {},
    appendChild() {},
    focus() {},
    dispatchEvent() {},
    addEventListener(ev, fn) { (handlers[id] = handlers[id] || {})[ev] = fn; },
    selectedOptions: [{ textContent: (values[id] || id) }],
    options: [],
    getAttribute() { return null; },
    querySelector() { return node(id + "-child"); },
  };
  return nodes[id];
}

const document = {
  getElementById: node,
  querySelectorAll: () => [],
  querySelector: () => null,
  createElement: () => node("tmp-" + Math.random()),
  addEventListener() {},
};

const sandbox = { document, window: {}, console, Event: function () {}, navigator: {} };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync("app.js", "utf8"), sandbox);

// Fire the Generate button the way a user would.
handlers["generate"].click();
const cfg = node("output").textContent;

const must = [
  ["hostname SW-TEST-01", "hostname"],
  ["crypto key generate rsa", "ssh key"],
  ["username netadmin privilege 15 secret 0 AnotherSecret123", "LOCAL SSH ACCOUNT"],
  ["line vty 0 15", "VTY LINES"],
  [" transport input ssh", "SSH ON VTY"],
  [" login local", "LOGIN LOCAL"],
  ["service password-encryption", "hardening: password encryption"],
  ["no ip http server", "hardening: http off"],
  [" spanning-tree portfast", "hardening: portfast"],
  [" spanning-tree bpduguard enable", "hardening: bpduguard"],
  [" switchport voice vlan 10", "voice vlan on access port"],
  ["WARNING: the next line contains a password in plain text", "cleartext warning"],
];

let bad = 0;
for (const [needle, label] of must) {
  const ok = cfg.includes(needle);
  if (!ok) bad++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}`);
}

// And the inverse: no username given must produce a loud comment, not silence.
node("ssh-user").value = "";
node("ssh-user-pass").value = "";
handlers["generate"].click();
const cfg2 = node("output").textContent;
const warned = cfg2.includes("no local username was");
console.log(`  ${warned ? "PASS" : "FAIL"}  warns when SSH has no account`);
if (!warned) bad++;

console.log(bad === 0 ? "\nALL CHECKS PASSED" : `\n${bad} CHECK(S) FAILED`);
process.exit(bad === 0 ? 0 : 1);
