#!/usr/bin/env node
// Generates every derived file of the Clinic from core/:
//
//   core/protocols/<name>.md        -> plugin/skills/<name>/SKILL.md (exact copy)
//   core/tools/zone-of-pain-analyzer.js -> plugin/skills/zone-of-pain/ (exact copy)
//   core/agents/<name>.md           -> plugin/agents/<name>.md            (Claude Code)
//                                   -> adapters/opencode/agents/<name>.md (OpenCode)
//                                   -> adapters/copilot/agents/<name>.agent.md (Copilot)
//
// Usage: node scripts/build.mjs [--check]
//   --check  exit 1 if any generated file is missing, stale or orphaned.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rel = (p) => path.relative(root, p).split(path.sep).join("/");
const read = (p) => fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n");

/** Parses a flat `key: value` front matter. Returns { data, body }. */
export function parseFrontMatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: content };
  const data = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^([\w-]+):\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    if (/^".*"$/.test(value)) value = JSON.parse(value);
    else if (/^'.*'$/.test(value)) value = value.slice(1, -1);
    data[m[1]] = value;
  }
  return { data, body: match[2] };
}

const yamlString = (s) => JSON.stringify(s);

// ── Harness-specific translations of a practitioner's access level ─────────

const CLAUDE_TOOLS = {
  read: "Read, Grep, Glob, Skill",
  run: "Read, Grep, Glob, Bash, Skill",
  build: "Read, Grep, Glob, Edit, Write, Bash, Task, Skill",
};

const OPENCODE_PERMISSIONS = {
  read: { edit: "deny", bash: "deny" },
  run: { edit: "deny", bash: "allow" },
  build: { edit: "allow", bash: "allow" },
};

const COPILOT_TOOLS = {
  read: ["read", "search"],
  run: ["read", "search", "execute"],
  build: ["read", "search", "edit", "execute", "agent"],
};

const generatedNote = (source) =>
  `<!-- Generated from ${source} by scripts/build.mjs. Edit the source, then run \`node scripts/build.mjs\`. -->\n\n`;

function renderClaude(agent, source) {
  const extras = Object.entries(agent.data)
    .filter(([key]) => key.startsWith("claude-"))
    .map(([key, value]) => `${key.slice("claude-".length)}: ${value}\n`)
    .join("");
  return (
    "---\n" +
    `name: ${agent.data.name}\n` +
    `description: ${yamlString(agent.data.description)}\n` +
    `tools: ${CLAUDE_TOOLS[agent.data.access]}\n` +
    `skills: ${agent.data.skill}\n` +
    "model: inherit\n" +
    extras +
    "---\n" +
    generatedNote(source) +
    `The \`${agent.data.skill}\` skill is preloaded in your context. If it is not, load it with the Skill tool before anything else.\n\n` +
    agent.body
  );
}

function renderOpenCode(agent, source) {
  const permission = OPENCODE_PERMISSIONS[agent.data.access];
  return (
    "---\n" +
    `description: ${yamlString(agent.data.description)}\n` +
    "mode: all\n" +
    "permission:\n" +
    `  edit: ${permission.edit}\n` +
    `  bash: ${permission.bash}\n` +
    "---\n" +
    generatedNote(source) +
    `Before anything else, load the \`${agent.data.skill}\` skill with the skill tool.\n\n` +
    agent.body
  );
}

function renderCopilot(agent, source) {
  const tools = COPILOT_TOOLS[agent.data.access].map((t) => `'${t}'`).join(", ");
  return (
    "---\n" +
    `name: ${agent.data.name}\n` +
    `description: ${yamlString(agent.data.description)}\n` +
    `tools: [${tools}]\n` +
    "user-invocable: true\n" +
    "disable-model-invocation: true\n" +
    "infer: false\n" +
    "---\n" +
    generatedNote(source) +
    `Before anything else, read \`.github/skills/${agent.data.skill}/SKILL.md\`: it is the \`${agent.data.skill}\` skill referred to below.\n\n` +
    agent.body
  );
}

// ── Plan the outputs ───────────────────────────────────────────────────────

export function planOutputs() {
  const outputs = [];
  const protocolsDir = path.join(root, "core", "protocols");
  const protocols = fs.readdirSync(protocolsDir).filter((f) => f.endsWith(".md")).sort();
  for (const file of protocols) {
    outputs.push({
      target: path.join(root, "plugin", "skills", path.basename(file, ".md"), "SKILL.md"),
      content: read(path.join(protocolsDir, file)),
    });
  }
  outputs.push({
    target: path.join(root, "plugin", "skills", "zone-of-pain", "zone-of-pain-analyzer.js"),
    content: read(path.join(root, "core", "tools", "zone-of-pain-analyzer.js")),
  });

  const agentsDir = path.join(root, "core", "agents");
  for (const file of fs.readdirSync(agentsDir).filter((f) => f.endsWith(".md")).sort()) {
    const source = `core/agents/${file}`;
    const agent = parseFrontMatter(read(path.join(agentsDir, file)));
    for (const key of ["name", "skill", "access", "description"]) {
      if (!agent.data[key]) throw new Error(`${source}: missing front matter field "${key}"`);
    }
    if (!CLAUDE_TOOLS[agent.data.access]) throw new Error(`${source}: unknown access "${agent.data.access}"`);
    if (!protocols.includes(`${agent.data.skill}.md`)) throw new Error(`${source}: unknown skill "${agent.data.skill}"`);
    const name = agent.data.name;
    outputs.push(
      { target: path.join(root, "plugin", "agents", `${name}.md`), content: renderClaude(agent, source) },
      { target: path.join(root, "adapters", "opencode", "agents", `${name}.md`), content: renderOpenCode(agent, source) },
      { target: path.join(root, "adapters", "copilot", "agents", `${name}.agent.md`), content: renderCopilot(agent, source) },
    );
  }
  return outputs;
}

/** Generated directories, and the hand-written files they may also contain. */
const GENERATED_DIRS = [
  { dir: "plugin/skills", keep: [] },
  { dir: "plugin/agents", keep: [] },
  { dir: "adapters/opencode/agents", keep: [] },
  { dir: "adapters/copilot/agents", keep: ["checkup.agent.md", "intensive-care.agent.md", "security-checkup.agent.md"] },
];

function listFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? listFiles(full) : [full];
  });
}

export function findOrphans(outputs) {
  const expected = new Set(outputs.map((o) => path.resolve(o.target)));
  return GENERATED_DIRS.flatMap(({ dir, keep }) =>
    listFiles(path.join(root, dir)).filter(
      (file) => !expected.has(path.resolve(file)) && !keep.includes(path.basename(file)),
    ),
  );
}

function main() {
  const args = process.argv.slice(2);
  const check = args.includes("--check");
  if (args.some((a) => a !== "--check")) {
    console.error("Usage: node scripts/build.mjs [--check]");
    process.exit(2);
  }

  const outputs = planOutputs();
  const stale = outputs.filter(({ target, content }) => !fs.existsSync(target) || read(target) !== content);
  const orphans = findOrphans(outputs);

  if (check) {
    for (const { target } of stale) console.error(`Out of date: ${rel(target)}`);
    for (const file of orphans) console.error(`Orphan (no source in core/): ${rel(file)}`);
    if (stale.length || orphans.length) {
      console.error("\nRun `node scripts/build.mjs` and commit the result.");
      process.exit(1);
    }
    console.log(`All ${outputs.length} generated files are up to date.`);
    return;
  }

  for (const { target, content } of stale) {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content, "utf8");
    console.log(`Generated ${rel(target)}`);
  }
  for (const file of orphans) {
    fs.rmSync(file);
    console.log(`Removed orphan ${rel(file)}`);
  }
  for (const { dir } of GENERATED_DIRS) {
    for (const sub of fs.existsSync(path.join(root, dir)) ? fs.readdirSync(path.join(root, dir)) : []) {
      const full = path.join(root, dir, sub);
      if (fs.statSync(full).isDirectory() && fs.readdirSync(full).length === 0) fs.rmdirSync(full);
    }
  }
  if (!stale.length && !orphans.length) console.log(`All ${outputs.length} generated files are already up to date.`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
