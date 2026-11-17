import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { findOrphans, parseFrontMatter, planOutputs } from "../scripts/build.mjs";
import { run as install } from "../scripts/install.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (...p) => fs.readFileSync(path.join(root, ...p), "utf8");
const list = (...p) => fs.readdirSync(path.join(root, ...p));

const protocols = list("core", "protocols").filter((f) => f.endsWith(".md")).map((f) => path.basename(f, ".md"));
const agents = list("core", "agents").filter((f) => f.endsWith(".md")).map((f) => parseFrontMatter(read("core", "agents", f)).data);

test("generated files are up to date with core/ (run `node scripts/build.mjs`)", () => {
  const outputs = planOutputs();
  const stale = outputs.filter(({ target, content }) => !fs.existsSync(target) || fs.readFileSync(target, "utf8").replace(/\r\n/g, "\n") !== content);
  assert.deepEqual(stale.map((o) => path.relative(root, o.target)), []);
  assert.deepEqual(findOrphans(outputs).map((f) => path.relative(root, f)), []);
});

test("every protocol is a valid skill: name matches the file, description is useful", () => {
  for (const name of protocols) {
    const { data, body } = parseFrontMatter(read("core", "protocols", `${name}.md`));
    assert.equal(data.name, name, `${name}: front matter name`);
    assert.ok(data.description && data.description.length >= 80, `${name}: description too short`);
    assert.ok(data.description.length <= 1024, `${name}: description over 1024 characters`);
    assert.match(data.description, /Use (when|only when)/, `${name}: description should say when to use it`);
    assert.ok(body.trim().length > 0, `${name}: empty body`);
  }
});

test("every diagnostic protocol uses its finding ID prefix and a location field", () => {
  const prefixes = { "code-therapist": "T1", "test-diagnostician": "D1", nutritionist: "N1", "zone-of-pain": "R1", immunologist: "X<n>" };
  for (const [name, id] of Object.entries(prefixes)) {
    const body = read("core", "protocols", `${name}.md`);
    assert.ok(body.includes(id), `${name}: output format should use ${id}`);
    assert.ok(/\*\*Where\*\*|path:line|\| File \|/.test(body), `${name}: findings need a location`);
  }
});

test("every practitioner points to an existing skill and a known access level", () => {
  assert.ok(agents.length >= 6);
  for (const agent of agents) {
    assert.ok(protocols.includes(agent.skill), `${agent.name}: unknown skill ${agent.skill}`);
    assert.ok(["read", "run", "build"].includes(agent.access), `${agent.name}: access ${agent.access}`);
  }
  assert.deepEqual(agents.filter((a) => a.access === "build").map((a) => a.name), ["surgeon"], "only the surgeon can operate");
});

test("commands and prompts only reference skills and agents that exist", () => {
  const names = new Set([...protocols, ...agents.map((a) => a.name), "checkup", "intensive-care", "security-checkup"]);
  const files = [
    ...list("plugin", "commands").map((f) => ["plugin", "commands", f]),
    ...list("adapters", "opencode", "commands").map((f) => ["adapters", "opencode", "commands", f]),
    ...list("adapters", "copilot", "prompts").map((f) => ["adapters", "copilot", "prompts", f]),
    ["adapters", "copilot", "agents", "checkup.agent.md"],
    ["adapters", "copilot", "agents", "intensive-care.agent.md"],
    ["adapters", "copilot", "agents", "security-checkup.agent.md"],
  ];
  for (const parts of files) {
    const content = read(...parts);
    for (const [, ref] of content.matchAll(/`([a-z][a-z-]+)` (?:skill|subagent)/g)) {
      assert.ok(names.has(ref), `${parts.join("/")}: unknown reference \`${ref}\``);
    }
    for (const [, ref] of content.matchAll(/\.github\/skills\/([a-z-]+)\/SKILL\.md/g)) {
      assert.ok(protocols.includes(ref), `${parts.join("/")}: unknown skill path ${ref}`);
    }
    const { data } = parseFrontMatter(content);
    if (data.agent) assert.ok(names.has(data.agent) || data.agent === "build", `${parts.join("/")}: unknown agent ${data.agent}`);
  }
});

test("every adapter exposes the same commands", () => {
  const base = (f) => f.replace(/\.(prompt\.)?md$/, "");
  const claude = list("plugin", "commands").map(base).sort();
  assert.deepEqual(list("adapters", "opencode", "commands").map(base).sort(), claude);
  assert.deepEqual(list("adapters", "copilot", "prompts").map(base).sort(), claude);
  const extension = read("adapters", "copilot", "extensions", "la-clinique-du-code", "extension.mjs");
  for (const name of claude) assert.ok(extension.includes(`command("${name}"`), `Copilot extension misses /${name}`);
  for (const agent of agents) assert.ok(extension.includes(`practitioner("${agent.name}"`), `Copilot extension misses ${agent.name}`);
});

test("plugin manifests agree on name and version", () => {
  const claude = JSON.parse(read("plugin", ".claude-plugin", "plugin.json"));
  const agentPlugins = JSON.parse(read("plugin", "plugin.json"));
  const marketplace = JSON.parse(read(".claude-plugin", "marketplace.json"));
  assert.equal(claude.name, agentPlugins.name);
  assert.equal(claude.version, agentPlugins.version);
  assert.equal(marketplace.plugins[0].name, claude.name);
  assert.equal(marketplace.plugins[0].source, "./plugin");
});

test("the installer is idempotent, preserves user files and uninstalls cleanly", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "clinic-install-"));
  const quiet = () => {};
  try {
    for (const target of ["claude", "opencode"]) {
      const dest = path.join(tmp, target);
      fs.mkdirSync(path.join(dest, "skills", "mine"), { recursive: true });
      fs.writeFileSync(path.join(dest, "skills", "mine", "SKILL.md"), "mine");
      assert.ok(install([target, "--dest", dest], quiet) > 0);
      assert.equal(install([target, "--dest", dest], quiet), 0, `${target}: second install changes nothing`);
      assert.ok(fs.existsSync(path.join(dest, "skills", "checkup", "SKILL.md")));
      install([target, "--dest", dest, "--uninstall"], quiet);
      assert.deepEqual(fs.readdirSync(path.join(dest, "skills")), ["mine"], `${target}: user skills untouched`);
    }

    const project = path.join(tmp, "project");
    fs.mkdirSync(path.join(project, ".github"), { recursive: true });
    fs.writeFileSync(path.join(project, ".github", "copilot-instructions.md"), "# Team rules\n");
    install(["copilot", "--project", project], quiet);
    install(["copilot", "--project", project], quiet);
    const instructions = fs.readFileSync(path.join(project, ".github", "copilot-instructions.md"), "utf8");
    assert.ok(instructions.startsWith("# Team rules"), "existing instructions are kept");
    assert.equal(instructions.split("la-clinique-du-code:start").length, 2, "the Clinic block is written once");
    install(["copilot", "--project", project, "--uninstall"], quiet);
    assert.equal(fs.readFileSync(path.join(project, ".github", "copilot-instructions.md"), "utf8"), "# Team rules\n");
    assert.deepEqual(fs.readdirSync(path.join(project, ".github")), ["copilot-instructions.md"]);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
