#!/usr/bin/env node
"use strict";

/*
 * Zone-of-pain analyzer v4 — the Architectural Radiologist's imaging device.
 *
 * Usage: node zone-of-pain-analyzer.js [--since <date>] [--path <dir>]...
 *                                       [--top <n>] [--temporal <n>] [--json]
 *
 * Run from anywhere inside a git repository. Read-only: it runs `git ls-files`
 * and `git log`, reads tracked source files, and prints a report to stdout.
 * It never writes a file. Requirements: Node.js >= 14, git, no npm install.
 *
 * Pain = sqrt(normalized churn × normalized coupling): a file scores only when
 * it changes often AND many files depend on it.
 */

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const VERSION = "4.0.0";

// ──────────────────────────────────────────────────────────────
// Configuration
// ──────────────────────────────────────────────────────────────

const SOURCE_EXT = new Set([
  ".java", ".kt", ".kts", ".scala",
  ".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".mts", ".cts", ".vue", ".svelte",
  ".py", ".rb", ".php", ".go", ".rs", ".cs", ".gd",
]);

const EXCLUDE_DIRS = new Set([
  "node_modules", "vendor", "target", "build", "dist", "out", "coverage",
  ".git", ".idea", ".vscode", "__pycache__", ".next", ".nuxt", ".venv", "venv",
  "generated", "__generated__", "migrations",
  ".godot", "addons", // Godot: import cache and third-party plugins (GUT...)
]);

const TEST_DIRS = new Set(["test", "tests", "__tests__", "spec", "specs", "testing", "e2e"]);

/** Commits touching more files than this are ignored for temporal coupling
 * (mass renames, reformatting, dependency bumps say nothing about design). */
const MAX_FILES_PER_COMMIT_FOR_TEMPORAL = 50;

// ──────────────────────────────────────────────────────────────
// Path helpers
// ──────────────────────────────────────────────────────────────

function toPosix(filePath) {
  return filePath.replace(/\\/g, "/").replace(/^\.\//, "");
}

function stripExtension(filePath) {
  const ext = path.posix.extname(filePath);
  return ext ? filePath.slice(0, -ext.length) : filePath;
}

function isTestFile(filePath) {
  const normalized = toPosix(filePath);
  const segments = normalized.split("/");
  if (segments.slice(0, -1).some((s) => TEST_DIRS.has(s.toLowerCase()))) return true;
  const base = stripExtension(segments[segments.length - 1]);
  return (
    /[.\-_](test|spec|tests|specs)$/i.test(base) || // a.test.ts, a_test.go, a-spec.js
    /^test_/i.test(base) || //                         test_a.py
    /[a-z0-9](Test|Tests|Spec|IT)$/.test(base) || //  FooTest.java, FooSpec.kt, FooIT.java
    /^(conftest|setupTests)$/.test(base)
  );
}

function isSourceFile(filePath) {
  const normalized = toPosix(filePath);
  if (!SOURCE_EXT.has(path.posix.extname(normalized).toLowerCase())) return false;
  const segments = normalized.split("/");
  if (segments.slice(0, -1).some((s) => EXCLUDE_DIRS.has(s))) return false;
  if (/\.d\.[cm]?ts$|\.min\.js$|\.generated\./.test(normalized)) return false;
  return !isTestFile(normalized);
}

function inScope(filePath, scopes) {
  if (scopes.length === 0) return true;
  return scopes.some((scope) => filePath === scope || filePath.startsWith(scope + "/"));
}

// ──────────────────────────────────────────────────────────────
// Import extraction
// ──────────────────────────────────────────────────────────────

function langForFile(filePath) {
  const ext = path.posix.extname(filePath).toLowerCase();
  if ([".js", ".jsx", ".mjs", ".cjs", ".ts", ".tsx", ".mts", ".cts", ".vue", ".svelte"].includes(ext)) return "js";
  if (ext === ".py") return "python";
  if (ext === ".go") return "go";
  if (ext === ".rb") return "ruby";
  if (ext === ".rs") return "rust";
  if (ext === ".cs") return "csharp";
  if (ext === ".php") return "php";
  if (ext === ".gd") return "gdscript";
  return "jvm"; // java, kotlin, scala
}

/**
 * Returns import specifiers found in a file, each as
 * { spec, relative, kind } where kind is "module" (a file) or "package"
 * (a directory: Go packages, C# namespaces, JVM wildcard imports).
 */
function extractImports(content, lang) {
  const found = [];
  const add = (spec, relative, kind) => {
    if (spec) found.push({ spec, relative: Boolean(relative), kind: kind || "module" });
  };
  const lines = content.split(/\r?\n/);
  let inGoImportBlock = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("//") || line.startsWith("#!") || (lang === "gdscript" && line.startsWith("#"))) continue;
    let m;

    if (lang === "js") {
      const fromRe = /(?:^|\s|})from\s+["']([^"']+)["']/g;
      while ((m = fromRe.exec(line))) add(m[1], m[1].startsWith("."));
      if ((m = line.match(/^import\s+["']([^"']+)["']/))) add(m[1], m[1].startsWith("."));
      const callRe = /\b(?:require|import)\s*\(\s*["']([^"']+)["']\s*\)/g;
      while ((m = callRe.exec(line))) add(m[1], m[1].startsWith("."));
    } else if (lang === "python") {
      if ((m = line.match(/^from\s+(\.*)([\w.]*)\s+import\s+(.+)$/))) {
        const dots = m[1];
        const base = m[2];
        const names = m[3].replace(/[()]/g, "").split(",").map((n) => n.trim().split(/\s+/)[0]).filter(Boolean);
        for (const name of names) {
          if (name !== "*") add(dots + (base ? base + "." : "") + name, dots.length > 0);
        }
        add(dots + base, dots.length > 0);
      } else if ((m = line.match(/^import\s+(.+)$/))) {
        for (const part of m[1].split(",")) add(part.trim().split(/\s+/)[0], false);
      }
    } else if (lang === "go") {
      if (/^import\s*\($/.test(line)) { inGoImportBlock = true; continue; }
      if (inGoImportBlock && line.startsWith(")")) { inGoImportBlock = false; continue; }
      if ((m = line.match(/^import\s+(?:[\w.]+\s+)?"([^"]+)"/))) add(m[1], false, "package");
      else if (inGoImportBlock && (m = line.match(/^(?:[\w.]+\s+)?"([^"]+)"/))) add(m[1], false, "package");
    } else if (lang === "ruby") {
      if ((m = line.match(/^require_relative\s+["']([^"']+)["']/))) add("./" + m[1].replace(/^\.\//, ""), true);
      else if ((m = line.match(/^(?:require|load)\s+["']([^"']+)["']/))) add(m[1], false);
      else if ((m = line.match(/^autoload\s+:\w+,\s*["']([^"']+)["']/))) add(m[1], false);
    } else if (lang === "rust") {
      if ((m = line.match(/^(?:pub(?:\([\w:]+\))?\s+)?use\s+((?:crate|super|self)(?:::\w+)+)/))) add(m[1], true);
      else if ((m = line.match(/^(?:pub(?:\([\w:]+\))?\s+)?mod\s+(\w+)\s*;/))) add("self::" + m[1], true);
    } else if (lang === "csharp") {
      if ((m = line.match(/^(?:global\s+)?using\s+(?:static\s+)?([A-Za-z_][\w.]*)\s*;/))) add(m[1], false, "package");
    } else if (lang === "gdscript") {
      // preload("res://a/b.gd"), load("res://a/b.gd"), extends "res://a/b.gd".
      // Dependencies through `class_name` are added by analyze() (classRefs).
      const resRe = /\b(?:preload|load|extends)\s*\(?\s*"res:\/\/([^"]+)"/g;
      while ((m = resRe.exec(line))) add(m[1], false);
    } else if (lang === "php") {
      if ((m = line.match(/^use\s+(?:function\s+|const\s+)?([\w\\]+)/))) add(m[1].replace(/\\/g, "/"), false);
      else if ((m = line.match(/^(?:require|include)(?:_once)?\s*\(?\s*__DIR__\s*\.\s*["']([^"']+)["']/))) add("." + m[1], true);
    } else {
      if ((m = line.match(/^import\s+(?:static\s+)?([\w.]+?)(\.\*)?(?:\s+as\s+\w+)?\s*;?$/))) add(m[1], false, m[2] ? "package" : "module");
    }
  }
  return found;
}

// ──────────────────────────────────────────────────────────────
// Import resolution
// ──────────────────────────────────────────────────────────────

const INDEX_NAMES = new Set(["index", "__init__", "mod", "main", "lib"]);

function buildIndex(files) {
  const byExactPath = new Map(); // "src/a/b" (no ext) -> file
  const bySuffix = new Map(); //    "a/b", "b" -> [files]
  const byDir = new Map(); //       "src/a" -> [files]
  const byDirSuffix = new Map(); // "a", "src/a" -> [dirs]

  const push = (map, key, value) => {
    if (!map.has(key)) map.set(key, []);
    if (!map.get(key).includes(value)) map.get(key).push(value);
  };

  for (const file of files) {
    const noExt = stripExtension(file);
    const segments = noExt.split("/");
    const keys = [noExt];
    if (INDEX_NAMES.has(segments[segments.length - 1]) && segments.length > 1) {
      keys.push(segments.slice(0, -1).join("/"));
    }
    for (const key of keys) {
      if (!byExactPath.has(key)) byExactPath.set(key, file);
      const parts = key.split("/");
      for (let i = 0; i < parts.length; i++) push(bySuffix, parts.slice(i).join("/"), file);
    }
    const dir = path.posix.dirname(file);
    push(byDir, dir, file);
    const dirParts = dir === "." ? [] : dir.split("/");
    for (let i = 0; i < dirParts.length; i++) push(byDirSuffix, dirParts.slice(i).join("/"), dir);
  }
  return { byExactPath, bySuffix, byDir, byDirSuffix };
}

function commonPrefixLength(a, b) {
  const pa = a.split("/");
  const pb = b.split("/");
  let i = 0;
  while (i < pa.length && i < pb.length && pa[i] === pb[i]) i++;
  return i;
}

function closest(candidates, fromFile) {
  if (candidates.length === 1) return candidates[0];
  let best = null;
  let bestScore = -1;
  let tie = false;
  for (const c of candidates) {
    const score = commonPrefixLength(path.posix.dirname(c), path.posix.dirname(fromFile));
    if (score > bestScore) { best = c; bestScore = score; tie = false; }
    else if (score === bestScore) tie = true;
  }
  return tie ? null : best; // ambiguous: better no edge than a wrong one
}

/** Converts an import specifier into slash-separated candidate paths. */
function specToPaths(imp, fromFile, lang) {
  const fromDir = path.posix.dirname(fromFile);
  const spec = imp.spec;

  if (lang === "python" && imp.relative) {
    const dots = spec.match(/^\.+/)[0].length;
    let base = fromDir;
    for (let i = 1; i < dots; i++) base = path.posix.dirname(base);
    const rest = spec.slice(dots).replace(/\./g, "/");
    return { exact: [rest ? path.posix.join(base, rest) : base] };
  }
  if (lang === "rust" && imp.relative) {
    const parts = spec.split("::");
    let base = parts[0] === "crate" ? null : fromDir;
    if (parts[0] === "super") base = path.posix.dirname(fromDir);
    const rest = parts.slice(1);
    const exact = [];
    for (let n = rest.length; n > 0; n--) {
      const tail = rest.slice(0, n).join("/");
      if (base) exact.push(path.posix.join(base, tail));
    }
    // crate:: paths are rooted at src/ of the crate: fall back to suffixes
    return { exact, suffix: base ? [] : rest.map((_, n) => rest.slice(0, rest.length - n).join("/")) };
  }
  if (imp.relative) {
    return { exact: [toPosix(path.posix.normalize(path.posix.join(fromDir, stripKnownExt(spec))))] };
  }

  // Non-relative: module paths, packages, namespaces, aliases (@/x, ~/x).
  const cleaned = spec.replace(/^[@~]\//, "").replace(/::/g, "/");
  const slashed = lang === "js" || lang === "go" || lang === "ruby" || lang === "php" || lang === "gdscript" ? cleaned : cleaned.replace(/\./g, "/");
  const parts = stripKnownExt(slashed).split("/").filter(Boolean);
  const suffix = [];
  // Full spec first, then without leading segments (namespace roots rarely
  // match folders: com.acme.billing.Invoice -> billing/Invoice).
  for (let i = 0; i < parts.length; i++) {
    const s = parts.slice(i).join("/");
    if (parts.length - i >= 2 || parts.length === 1) suffix.push(s);
  }
  // JVM static imports and Python "from pkg import name" may end with a member.
  if ((lang === "jvm" || lang === "python") && parts.length > 2) {
    const owner = parts.slice(0, -1);
    for (let i = 0; i < owner.length - 1; i++) suffix.push(owner.slice(i).join("/"));
  }
  return { exact: [], suffix };
}

function stripKnownExt(spec) {
  const ext = path.posix.extname(spec).toLowerCase();
  return SOURCE_EXT.has(ext) ? spec.slice(0, -ext.length) : spec;
}

/** Returns the list of project files an import points to (possibly empty). */
function resolveImport(imp, fromFile, lang, index) {
  const { exact = [], suffix = [] } = specToPaths(imp, fromFile, lang);

  for (const candidate of exact) {
    if (imp.kind === "package" && index.byDir.has(candidate)) return index.byDir.get(candidate);
    if (index.byExactPath.has(candidate)) return [index.byExactPath.get(candidate)];
  }
  for (const candidate of suffix) {
    if (imp.kind === "package") {
      const dirs = index.byDirSuffix.get(candidate);
      if (dirs) {
        const dir = closest(dirs, fromFile);
        if (dir) return index.byDir.get(dir);
      }
    }
    const files = index.bySuffix.get(candidate);
    if (files) {
      // A single-segment specifier ("utils") must be unambiguous.
      const file = candidate.includes("/") ? closest(files, fromFile) : files.length === 1 ? files[0] : null;
      if (file) return [file];
    }
  }
  return [];
}

// ──────────────────────────────────────────────────────────────
// GDScript: dependencies through `class_name`
// ──────────────────────────────────────────────────────────────

/** Maps each `class_name Foo` declared in the project to its file. */
function gdscriptClassOwners(root, files) {
  const owners = new Map();
  for (const file of files) {
    if (!file.endsWith(".gd")) continue;
    let content;
    try {
      content = fs.readFileSync(path.join(root, file), "utf8");
    } catch (error) {
      continue;
    }
    const m = content.match(/^class_name\s+(\w+)/m);
    if (m) owners.set(m[1], file);
  }
  return owners;
}

/** Files whose `class_name` is referenced as a word in `content` (comments and strings ignored). */
function classRefs(content, owners) {
  if (owners.size === 0) return [];
  const code = content
    .split(/\r?\n/)
    .filter((l) => !l.trim().startsWith("#"))
    .join("\n")
    .replace(/"(?:[^"\\\n]|\\.)*"/g, '""');
  const words = new Set(code.match(/\b[A-Za-z_]\w*\b/g) || []);
  const targets = [];
  for (const [name, file] of owners) if (words.has(name)) targets.push(file);
  return targets;
}

// ──────────────────────────────────────────────────────────────
// Git
// ──────────────────────────────────────────────────────────────

function git(args, cwd) {
  return execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 512 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function readCommits(root, since) {
  const args = ["log", "--no-merges", "--no-renames", "--format=%x00%H", "--name-only"];
  if (since) args.push(`--since=${since}`);
  args.push("HEAD", "--");
  const raw = git(args, root);
  const commits = [];
  for (const chunk of raw.split("\0")) {
    const lines = chunk.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length < 2) continue;
    commits.push(lines.slice(1).map(toPosix));
  }
  return commits;
}

// ──────────────────────────────────────────────────────────────
// Analysis
// ──────────────────────────────────────────────────────────────

/** How two co-changing files are related: "import", "same package" (Go files
 * of one directory share a package without importing each other) or "none". */
function linkBetween(a, b, importers) {
  if (importers.get(a).has(b) || importers.get(b).has(a)) return "import";
  if (langForFile(a) === "go" && langForFile(b) === "go" && path.posix.dirname(a) === path.posix.dirname(b)) return "same package";
  return "none";
}

function analyze(options) {
  const opts = Object.assign({ cwd: process.cwd(), since: null, scopes: [], top: 15, temporal: 5 }, options);

  let root;
  try {
    root = git(["rev-parse", "--show-toplevel"], opts.cwd).trim();
  } catch (error) {
    throw new Error("Not a git repository. Run the analyzer from inside the repository to x-ray.");
  }
  const prefix = git(["rev-parse", "--show-prefix"], opts.cwd).trim().replace(/\/$/, "");
  const scopes = opts.scopes.map((s) => toPosix(path.posix.normalize(path.posix.join(prefix, toPosix(s))))).map((s) => s.replace(/\/$/, "")).filter((s) => s && s !== ".");

  const tracked = git(["ls-files", "-z"], root).split("\0").filter(Boolean).map(toPosix);
  const sourceFiles = tracked.filter((f) => isSourceFile(f) && fs.existsSync(path.join(root, f)));
  const sourceSet = new Set(sourceFiles);
  const scopedFiles = sourceFiles.filter((f) => inScope(f, scopes));

  // 1. Churn
  let commits = [];
  try {
    commits = readCommits(root, opts.since);
  } catch (error) {
    commits = []; // empty repository (no HEAD yet)
  }
  const churn = new Map();
  for (const files of commits) {
    for (const f of files) if (sourceSet.has(f)) churn.set(f, (churn.get(f) || 0) + 1);
  }

  // 2. Coupling — number of distinct files importing each file
  const index = buildIndex(sourceFiles);
  const classOwners = gdscriptClassOwners(root, sourceFiles);
  const importers = new Map(sourceFiles.map((f) => [f, new Set()]));
  let importCount = 0;
  let resolvedCount = 0;
  for (const file of sourceFiles) {
    let content;
    try {
      content = fs.readFileSync(path.join(root, file), "utf8");
    } catch (error) {
      continue;
    }
    const lang = langForFile(file);
    if (lang === "gdscript") {
      for (const target of classRefs(content, classOwners)) {
        if (target === file) continue;
        importCount++;
        resolvedCount++;
        importers.get(target).add(file);
      }
    }
    for (const imp of extractImports(content, lang)) {
      importCount++;
      const targets = resolveImport(imp, file, lang, index).filter((t) => t !== file);
      if (targets.length > 0) resolvedCount++;
      for (const target of targets) importers.get(target).add(file);
    }
  }

  // 3. Pain
  const coupling = (f) => importers.get(f).size;
  const maxChurn = scopedFiles.reduce((max, f) => Math.max(max, churn.get(f) || 0), 1);
  const maxCoupling = scopedFiles.reduce((max, f) => Math.max(max, coupling(f)), 1);
  const scored = scopedFiles.map((file) => {
    const c = churn.get(file) || 0;
    const k = coupling(file);
    const pain = Math.sqrt((c / maxChurn) * (k / maxCoupling));
    return { file, churn: c, coupling: k, pain: Number(pain.toFixed(3)) };
  });
  const painZones = scored
    .filter((s) => s.pain > 0)
    .sort((a, b) => b.pain - a.pain || b.churn - a.churn || a.file.localeCompare(b.file))
    .slice(0, opts.top);

  const topChurn = scopedFiles
    .filter((f) => churn.has(f))
    .map((file) => ({ file, churn: churn.get(file) }))
    .sort((a, b) => b.churn - a.churn || a.file.localeCompare(b.file))
    .slice(0, Math.max(opts.temporal, 5));

  // 4. Temporal coupling for the most unstable files
  const targets = topChurn.slice(0, opts.temporal).map((e) => e.file);
  const targetSet = new Set(targets);
  const coChanges = new Map(targets.map((t) => [t, new Map()]));
  let usableCommits = 0;
  for (const files of commits) {
    const relevant = files.filter((f) => sourceSet.has(f));
    if (relevant.length < 2 || relevant.length > MAX_FILES_PER_COMMIT_FOR_TEMPORAL) continue;
    usableCommits++;
    for (const target of relevant.filter((f) => targetSet.has(f))) {
      const counts = coChanges.get(target);
      for (const other of relevant) if (other !== target) counts.set(other, (counts.get(other) || 0) + 1);
    }
  }
  const temporalCoupling = targets.map((file) => ({
    file,
    churn: churn.get(file),
    coChangedWith: [...coChanges.get(file).entries()]
      .map(([other, times]) => ({
        file: other,
        times,
        ratio: Number((times / churn.get(file)).toFixed(2)),
        link: linkBetween(file, other, importers),
      }))
      .filter((e) => e.times >= 2)
      .sort((a, b) => b.times - a.times || a.file.localeCompare(b.file))
      .slice(0, 5),
  }));

  return {
    version: VERSION,
    root,
    since: opts.since,
    scopes,
    stats: {
      sourceFiles: scopedFiles.length,
      filesWithChurn: scopedFiles.filter((f) => churn.has(f)).length,
      filesWithIncomingImports: scopedFiles.filter((f) => coupling(f) > 0).length,
      commits: commits.length,
      commitsUsedForTemporal: usableCommits,
      imports: importCount,
      importsResolved: resolvedCount,
    },
    topChurn,
    painZones,
    temporalCoupling,
  };
}

// ──────────────────────────────────────────────────────────────
// Rendering
// ──────────────────────────────────────────────────────────────

function renderMarkdown(r) {
  const out = [];
  const s = r.stats;
  out.push(`# 🩻 Zone of pain — x-ray (analyzer v${r.version})`);
  out.push("");
  out.push(`- Repository: \`${path.basename(r.root)}\`${r.scopes.length ? ` · scope: ${r.scopes.map((x) => `\`${x}\``).join(", ")}` : ""}`);
  out.push(`- History: ${s.commits} commit${s.commits === 1 ? "" : "s"}${r.since ? ` since ${r.since}` : " (full history of HEAD)"}`);
  out.push(`- Source files (tests excluded): ${s.sourceFiles} · with churn: ${s.filesWithChurn} · with incoming imports: ${s.filesWithIncomingImports}`);
  out.push(`- Imports parsed: ${s.imports} · resolved to project files: ${s.importsResolved}`);
  out.push("");

  out.push("## Pain zones");
  out.push("");
  out.push("Pain = √(normalized churn × normalized coupling). Churn = commits touching the file; coupling = distinct files importing it.");
  out.push("");
  if (r.painZones.length === 0) {
    out.push("No file is both changing and depended upon: no pain zone detected.");
  } else {
    out.push("| # | File | Churn | Coupling | Pain |");
    out.push("|---|---|---|---|---|");
    r.painZones.forEach((z, i) => out.push(`| ${i + 1} | \`${z.file}\` | ${z.churn} | ${z.coupling} | ${z.pain.toFixed(3)} |`));
  }
  out.push("");

  out.push("## Most unstable files");
  out.push("");
  if (r.topChurn.length === 0) out.push("No history for the source files in scope.");
  else r.topChurn.forEach((e) => out.push(`- ${e.churn} commit${e.churn === 1 ? "" : "s"} — \`${e.file}\``));
  out.push("");

  out.push("## Temporal coupling");
  out.push("");
  out.push(`Files changed together at least twice (commits touching more than ${MAX_FILES_PER_COMMIT_FOR_TEMPORAL} source files are ignored). A pair that co-changes often without importing each other is hidden coupling.`);
  out.push("");
  const withPairs = r.temporalCoupling.filter((t) => t.coChangedWith.length > 0);
  if (withPairs.length === 0) {
    out.push("No actionable temporal coupling found.");
  } else {
    for (const t of withPairs) {
      out.push(`### \`${t.file}\` (churn ${t.churn})`);
      out.push("");
      out.push("| Co-changed with | Times | Share of its commits | Import link |");
      out.push("|---|---|---|---|");
      for (const p of t.coChangedWith) {
        out.push(`| \`${p.file}\` | ${p.times} | ${Math.round(p.ratio * 100)}% | ${p.link === "none" ? "**none — hidden**" : p.link} |`);
      }
      out.push("");
    }
  }
  return out.join("\n");
}

// ──────────────────────────────────────────────────────────────
// CLI
// ──────────────────────────────────────────────────────────────

const HELP = `Zone-of-pain analyzer v${VERSION} — read-only git x-ray

Usage: node zone-of-pain-analyzer.js [options]

  --since <date>     Only count history since <date> (git syntax: "12 months ago", 2025-01-01)
  --path <dir>       Restrict the report to a folder (repeatable); imports from
                     the whole repository still count toward coupling
  --top <n>          Number of pain zones to list (default 15)
  --temporal <n>     Number of unstable files to analyze for temporal coupling (default 5)
  --json             Print a JSON report instead of Markdown
  -h, --help         Show this help`;

function parseArgs(argv) {
  const opts = { since: null, scopes: [], top: 15, temporal: 5, json: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => {
      if (i + 1 >= argv.length) throw new Error(`Missing value for ${arg}`);
      return argv[++i];
    };
    const positiveInt = (value) => {
      const n = Number.parseInt(value, 10);
      if (!Number.isInteger(n) || n <= 0) throw new Error(`${arg} expects a positive integer`);
      return n;
    };
    if (arg === "-h" || arg === "--help") opts.help = true;
    else if (arg === "--json") opts.json = true;
    else if (arg === "--since") opts.since = next();
    else if (arg === "--path") opts.scopes.push(next());
    else if (arg === "--top") opts.top = positiveInt(next());
    else if (arg === "--temporal") opts.temporal = positiveInt(next());
    else throw new Error(`Unknown option: ${arg}`);
  }
  return opts;
}

function main(argv) {
  let opts;
  try {
    opts = parseArgs(argv);
  } catch (error) {
    console.error(`${error.message}\n\n${HELP}`);
    return 2;
  }
  if (opts.help) {
    console.log(HELP);
    return 0;
  }
  try {
    const report = analyze(opts);
    console.log(opts.json ? JSON.stringify(report, null, 2) : renderMarkdown(report));
    return 0;
  } catch (error) {
    console.error(`❌ ${error.message}`);
    return 1;
  }
}

module.exports = { analyze, extractImports, isSourceFile, isTestFile, parseArgs, renderMarkdown };

if (require.main === module) {
  process.exitCode = main(process.argv.slice(2));
}
