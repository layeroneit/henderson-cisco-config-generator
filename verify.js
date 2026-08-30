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
  "trunk-allowed": "", "interface-desc": "Desk ports", "uplink-ports": "",
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
    attrs: {},
    setAttribute(k, v) { this.attrs[k] = v; },
    getAttribute(k) { return this.attrs[k] !== undefined ? this.attrs[k] : null; },
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
const cfg = node("output").getAttribute("data-plain");

const must = [
  ["hostname SW-TEST-01", "hostname"],
  ["crypto key generate rsa", "ssh key"],
  ["username netadmin privilege 15 algorithm-type sha256 secret AnotherSecret123", "LOCAL SSH ACCOUNT"],
  ["line vty 0 15", "VTY LINES"],
  [" transport input ssh", "SSH ON VTY"],
  [" login local", "LOGIN LOCAL"],
  ["service password-encryption", "hardening: password encryption"],
  ["no ip http server", "hardening: http off"],
  [" spanning-tree portfast", "hardening: portfast"],
  [" spanning-tree bpduguard enable", "hardening: bpduguard"],
  [" switchport voice vlan 10", "voice vlan on access port"],
  ["WARNING: the next line contains a password in plain text", "cleartext warning"],
  ["ip domain name company.local", "ip domain name (two words)"],
  ["algorithm-type sha256", "type 8 password hash"],
  ["RUN THESE SEPARATELY", "crypto key emitted as a separate step"],
  ["including whichever one is your uplink", "uplink lockout warning"],
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
const cfg2 = node("output").getAttribute("data-plain");
const warned = cfg2.includes("no local username was");
console.log(`  ${warned ? "PASS" : "FAIL"}  warns when SSH has no account`);
if (!warned) bad++;

// --- platform matrix ------------------------------------------------------
// The interface keyword tracks the platform and the port speed. Getting it
// wrong yields a config that fails on paste, which no diff would reveal.
const cases = [
  ["c9200", "48", "gi", "GigabitEthernet1/0/1 - 48"],
  ["c9300", "48", "ten", "TenGigabitEthernet1/0/1 - 48"],
  ["c9300x", "24", "twentyfive", "TwentyFiveGigE1/0/1 - 24"],
  ["c9500", "32", "hundred", "HundredGigE1/0/1 - 32"],
  ["c9500x", "36", "fifty", "FiftyGigE1/0/1 - 36"],
];
for (const [model, dens, dtype, expect] of cases) {
  node("model").value = model;
  node("port-density").value = dens;
  node("downlink-type").value = dtype;
  node("chassis-slot").value = "1";
  handlers["generate"].click();
  const c = node("output").getAttribute("data-plain") || "";
  const ok = c.includes("interface range " + expect);
  if (!ok) bad++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${model} ${dens}p -> ${expect}`);
}

node("model").value = "c9400";
node("port-density").value = "48";
node("downlink-type").value = "gi";
node("chassis-slot").value = "3";
handlers["generate"].click();
const modular = (node("output").getAttribute("data-plain") || "").includes("interface range GigabitEthernet3/0/1 - 48");
console.log(`  ${modular ? "PASS" : "FAIL"}  c9400 slot 3 -> GigabitEthernet3/0/1 - 48`);
if (!modular) bad++;

for (const [model, wanIntf] of [["c8500", "TenGigabitEthernet0/0/0"], ["isr4331", "GigabitEthernet0/0/0"], ["c8000v", "GigabitEthernet1"]]) {
  node("model").value = model;
  handlers["generate"].click();
  const r = node("output").getAttribute("data-plain") || "";
  const ok = !r.includes("FastEthernet") && r.includes("interface " + wanIntf);
  if (!ok) bad++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${model} -> ${wanIntf}, no FastEthernet`);
}

node("model").value = "c9500";
node("downlink-type").value = "hundred";
handlers["generate"].click();
const allCfg = node("output").getAttribute("data-plain") || "";
const xr = /TenGigE|FortyGigE|TwentyFiveGigabitEthernet|HundredGigabitEthernet/.test(allCfg);
console.log(`  ${!xr ? "PASS" : "FAIL"}  no IOS-XR interface spellings`);
if (xr) bad++;

console.log(bad === 0 ? "\nALL CHECKS PASSED" : `\n${bad} CHECK(S) FAILED`);
process.exit(bad === 0 ? 0 : 1);
