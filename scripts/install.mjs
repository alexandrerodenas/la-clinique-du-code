#!/usr/bin/env node
// Cross-platform installer for the Clinic's adapters (Windows, macOS, Linux).
//
//   node scripts/install.mjs claude   [--dest <dir>]      # default ~/.claude
//   node scripts/install.mjs opencode [--dest <dir>]      # default $XDG_CONFIG_HOME/opencode or ~/.config/opencode
//   node scripts/install.mjs copilot  [--project <dir>]   # default: current directory
//
// Options: --dry-run (print what would change), --uninstall (remove the
// Clinic's files only). Claude Code users should prefer the plugin:
//   claude plugin marketplace add alexandrerodenas/la-clinique-du-code

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const from = (...parts) => path.join(root, ...parts);

const BLOCK_START = "<!-- la-clinique-du-code:start -->";
const BLOCK_END = "<!-- la-clinique-du-code:end -->";

function filesIn(dir, filter = () => true) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return filesIn(full, filter).map((f) => path.join(entry.name, f));
    return filter(entry.name) ? [entry.name] : [];
  });
}

/** Copies every file of `sourceDir` into `targetDir`, keeping relative paths. */
function tree(sourceDir, targetDir, filter) {
  return filesIn(sourceDir, filter).map((relPath) => ({
    source: path.join(sourceDir, relPath),
    target: path.join(targetDir, relPath),
  }));
}

function plan(target, options) {
  const home = os.homedir();
  if (target === "claude") {
    const dest = options.dest || path.join(home, ".claude");
    return {
      dest,
      files: [
        ...tree(from("plugin", "skills"), path.join(dest, "skills")),
        ...tree(from("plugin", "agents"), path.join(dest, "agents")),
        ...tree(from("plugin", "commands"), path.join(dest, "commands")),
      ],
      after: ["Restart Claude Code. Tip: the plugin install keeps the Clinic up to date with `claude plugin update`."],
    };
  }
  if (target === "opencode") {
    const config = process.env.XDG_CONFIG_HOME || path.join(home, ".config");
    const dest = options.dest || path.join(config, "opencode");
    return {
      dest,
      files: [
        ...tree(from("plugin", "skills"), path.join(dest, "skills")),
        ...tree(from("adapters", "opencode", "agents"), path.join(dest, "agent")),
        ...tree(from("adapters", "opencode", "commands"), path.join(dest, "commands")),
      ],
      after: [
        "Restart OpenCode.",
        `Optional: add ${path.relative(process.cwd(), from("adapters", "opencode", "templates", "AGENTS.md.clinic"))} to your AGENTS.md so the assistant can suggest a checkup.`,
      ],
    };
  }
  if (target === "copilot") {
    const project = path.resolve(options.project || process.cwd());
    if (!fs.existsSync(project) || !fs.statSync(project).isDirectory()) {
      throw new Error(`Target project not found: ${project}`);
    }
    if (path.resolve(project) === root) throw new Error("Pass --project <dir>: the target is your project, not the Clinic itself.");
    const github = path.join(project, ".github");
    return {
      dest: project,
      files: [
        ...tree(from("plugin", "skills"), path.join(github, "skills")),
        ...tree(from("adapters", "copilot", "agents"), path.join(github, "agents")),
        ...tree(from("adapters", "copilot", "prompts"), path.join(github, "prompts")),
        ...tree(from("adapters", "copilot", "extensions"), path.join(github, "extensions")),
      ],
      blocks: [{ source: from("adapters", "copilot", "templates", "copilot-instructions.md"), target: path.join(github, "copilot-instructions.md") }],
      after: ["Reload VS Code or restart the Copilot application. Commit the .github/ files to share the Clinic with your team."],
    };
  }
  throw new Error(`Unknown target "${target}". Expected: claude, opencode or copilot.`);
}

/** Inserts or replaces the Clinic's block in a file the user may own. */
function mergeBlock(existing, block) {
  const wrapped = `${BLOCK_START}\n${block.trim()}\n${BLOCK_END}\n`;
  if (existing === null) return wrapped;
  const start = existing.indexOf(BLOCK_START);
  const end = existing.indexOf(BLOCK_END);
  if (start !== -1 && end > start) {
    return existing.slice(0, start) + wrapped + existing.slice(end + BLOCK_END.length).replace(/^\n/, "");
  }
  return existing.replace(/\s*$/, "\n\n") + wrapped;
}

function removeBlock(existing) {
  const start = existing.indexOf(BLOCK_START);
  const end = existing.indexOf(BLOCK_END);
  if (start === -1 || end < start) return existing;
  return (existing.slice(0, start) + existing.slice(end + BLOCK_END.length)).replace(/\n{3,}/g, "\n\n").trim() + "\n";
}

function readOrNull(file) {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
}

export function run(argv, log = console.log) {
  const [target, ...rest] = argv;
  const options = { dryRun: false, uninstall: false };
  for (let i = 0; i < rest.length; i++) {
    const arg = rest[i];
    if (arg === "--dry-run") options.dryRun = true;
    else if (arg === "--uninstall") options.uninstall = true;
    else if (arg === "--dest" || arg === "--project") {
      if (!rest[i + 1]) throw new Error(`Missing value for ${arg}`);
      options[arg.slice(2)] = rest[++i];
    } else throw new Error(`Unknown option: ${arg}`);
  }
  if (!target || target.startsWith("-")) {
    throw new Error("Usage: node scripts/install.mjs <claude|opencode|copilot> [--dest <dir>|--project <dir>] [--dry-run] [--uninstall]");
  }

  const { dest, files, blocks = [], after } = plan(target, options);
  const verb = options.uninstall ? "Uninstalling" : "Installing";
  log(`🏥 La Clinique du Code — ${verb} the ${target} adapter in ${dest}${options.dryRun ? " (dry run)" : ""}`);

  let changed = 0;
  for (const { source, target: file } of files) {
    if (options.uninstall) {
      if (!fs.existsSync(file)) continue;
      log(`  - ${file}`);
      if (!options.dryRun) fs.rmSync(file);
    } else {
      const content = fs.readFileSync(source);
      const current = fs.existsSync(file) ? fs.readFileSync(file) : null;
      if (current && current.equals(content)) continue;
      log(`  ${current ? "~" : "+"} ${file}`);
      if (!options.dryRun) {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, content);
      }
    }
    changed++;
  }

  for (const { source, target: file } of blocks) {
    const current = readOrNull(file);
    const next = options.uninstall ? (current === null ? null : removeBlock(current)) : mergeBlock(current, fs.readFileSync(source, "utf8"));
    if (next === current) continue;
    log(`  ${options.uninstall ? "-" : current === null ? "+" : "~"} ${file} (Clinic block only)`);
    if (!options.dryRun) {
      if (next === null || next.trim() === "") fs.rmSync(file, { force: true });
      else {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, next);
      }
    }
    changed++;
  }

  if (options.uninstall && !options.dryRun) {
    // Remove the folders the Clinic left empty, up to (never including) dest.
    const dirs = [...new Set(files.map((f) => path.dirname(f.target)))].sort((x, y) => y.length - x.length);
    for (let dir of dirs) {
      while (dir.startsWith(dest + path.sep) && fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
        fs.rmdirSync(dir);
        dir = path.dirname(dir);
      }
    }
  }

  log(changed === 0 ? "  Nothing to do: already up to date." : `  ${changed} file(s) ${options.dryRun ? "would change" : "changed"}.`);
  if (!options.uninstall) for (const line of after) log(`  → ${line}`);
  return changed;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    run(process.argv.slice(2));
  } catch (error) {
    console.error(`❌ ${error.message}`);
    process.exit(1);
  }
}
