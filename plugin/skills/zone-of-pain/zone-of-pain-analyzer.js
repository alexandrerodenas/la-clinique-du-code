#!/usr/bin/env node
"use strict";

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

/*
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  ZONE-OF-PAIN ANALYZER v3 — Fixed path prefixes, test exclusions, temporal coupling ║
 * ║  Usage: node zone-of-pain-analyzer.js                           ║
 * ║  Run from the root of any git project.                          ║
 * ║  Requirements: Node.js >= 14, no npm install needed.            ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

// ──────────────────────────────────────────────────────────────
// CONFIG & FILTERS
// ──────────────────────────────────────────────────────────────

const EXCLUDE_DIRS = new Set([
  "node_modules", "target", "build", "dist", ".git", ".idea",
  ".vscode", "out", "__pycache__", ".next", ".nuxt",
]);

const EXCLUDE_FILES = new Set([
  "pom.xml", "package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
  "tsconfig.json", "jsconfig.json", "build.gradle", "settings.gradle",
  "Cargo.toml", "renovate.json", ".prettierrc", ".eslintrc",
]);

const SOURCE_EXT = new Set([".java", ".js", ".jsx", ".ts", ".tsx", ".py", ".cs", ".go", ".rb", ".rs", ".kt", ".kts"]);

// Source dir patterns — discovered recursively at any depth
const SRC_PATTERNS = ["src/main/java", "src/main/ts", "src/main/js", "src", "lib", "app", "packages"];

// ──────────────────────────────────────────────────────────────
// HELPER FUNCTIONS
// ──────────────────────────────────────────────────────────────

function isSourceFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!SOURCE_EXT.has(ext)) return false;
  const base = path.basename(filePath);
  if (EXCLUDE_FILES.has(base)) return false;
  // Exclude test files: names ending in Test/Spec, or paths containing /test/
  if (/^.*[Tt]est(\+\+|\..*)?$/.test(base) || /^.*[Ss]pec(\+\+|\..*)?$/.test(base)) return false;
  if (/\.test\./.test(filePath) || /\.spec\./.test(filePath)) return false;
  // Also filter files in test directories
  const normalized = filePath.replace(/\\/g, "/");
  const segments = normalized.split("/");
  if (segments.some(s => /^test(s)?$/.test(s))) return false;
  for (const seg of segments) {
    if (EXCLUDE_DIRS.has(seg)) return false;
  }
  return true;
}

function isTestFile(filePath) {
  const base = path.basename(filePath, path.extname(filePath));
  if (/Test$/.test(base) || /Spec$/.test(base)) return true;
  const normalized = filePath.replace(/\\/g, "/");
  const segments = normalized.split("/");
  if (segments.some(s => /^test(s)?$/.test(s))) return true;
  if (/\.test\./.test(filePath) || /\.spec\./.test(filePath)) return true;
  return false;
}

function norm(f) { return f.replace(/\\/g, "/").replace(/^\.\//, ""); }

function splitPathSegments(filePath) {
  return norm(filePath).split("/").filter(Boolean);
}

function stripSourceExtension(filePath) {
  const ext = path.extname(filePath);
  return ext ? filePath.slice(0, -ext.length) : filePath;
}

function buildAliases(filePath) {
  const normalized = norm(filePath);
  const withoutExt = stripSourceExtension(normalized);
  const segments = splitPathSegments(withoutExt);
  const aliases = new Set();

  for (let i = 0; i < segments.length; i++) {
    aliases.add(segments.slice(i).join("/"));
  }

  aliases.add(segments.join("."));
  aliases.add(segments[segments.length - 1]);
  aliases.add("./" + segments.join("/"));
  aliases.add("../" + segments.join("/"));
  return [...aliases].filter(Boolean);
}

function langForFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".py") return "python";
  if (ext === ".go") return "go";
  if (ext === ".ts" || ext === ".tsx") return "ts";
  if (ext === ".js" || ext === ".jsx") return "js";
  if (ext === ".rb") return "rb";
  if (ext === ".cs") return "cs";
  return "generic";
}

function extractImportCandidates(line, lang) {
  const trimmed = line.trim();
  const candidates = [];

  let m = trimmed.match(/^import\s+(?:static\s+)?([\w.\/]+)/);
  if (m) candidates.push(m[1]);

  m = trimmed.match(/^from\s+([\w.\/]+)\s+import\s+/);
  if (m) candidates.push(m[1]);

  m = trimmed.match(/^using\s+([\w.\/]+)\s*;/);
  if (m) candidates.push(m[1]);

  if (lang === "go") {
    m = trimmed.match(/^import\s+\"([^\"]+)\"/);
    if (m) candidates.push(m[1]);
    m = trimmed.match(/^\"([^\"]+)\"$/);
    if (m) candidates.push(m[1]);
  }

  if (lang === "ts" || lang === "js") {
    m = trimmed.match(/^(?:import|export)\s+.*?from\s+["']([^"']+)["']/);
    if (m) candidates.push(m[1]);
    m = trimmed.match(/^import\s+["']([^"']+)["']/);
    if (m) candidates.push(m[1]);
    m = trimmed.match(/^require\(["']([^"']+)["']\)/);
    if (m) candidates.push(m[1]);
  }

  if (lang === "rb") {
    m = trimmed.match(/^require(?:_relative)?\s+["']([^"']+)["']/);
    if (m) candidates.push(m[1]);
    m = trimmed.match(/^autoload\s+:[\w?]+,\s+["']([^"']+)["']/);
    if (m) candidates.push(m[1]);
  }

  if (lang === "cs") {
    m = trimmed.match(/^using\s+([A-Za-z0-9_.]+)\s*;/);
    if (m) candidates.push(m[1]);
    m = trimmed.match(/^global\s+using\s+([A-Za-z0-9_.]+)\s*;/);
    if (m) candidates.push(m[1]);
  }

  return candidates;
}

function shouldSkipExternalImport(token, lang) {
  const common = [
    "typing", "collections", "dataclasses", "contextlib", "pathlib", "asyncio",
    "os", "sys", "re", "json", "time", "datetime", "math", "uuid", "base64",
    "logging", "itertools", "urllib", "functools", "inspect", "subprocess",
  ];
  const javaLike = [
    "java.", "javax.", "jakarta.", "org.xml.", "org.slf4j.", "ch.qos.logback.",
    "com.fasterxml.", "org.apache.", "org.springframework.", "org.hibernate.",
  ];
  const cs = ["System.", "Microsoft.", "Newtonsoft."];
  const ruby = ["json", "yaml", "set", "open-uri", "net/http", "logger"];

  const prefixes = [...common];
  if (lang === "cs") prefixes.push(...cs);
  if (lang === "rb") prefixes.push(...ruby);
  if (lang === "java" || lang === "generic") prefixes.push(...javaLike);

  return prefixes.some((prefix) => token === prefix || token.startsWith(prefix + ".") || token.startsWith(prefix + "/"));
}

// ──────────────────────────────────────────────────────────────
// STEP 1: GIT CHURN — Pure Node.js
// ──────────────────────────────────────────────────────────────

function computeChurn(srcDirs) {
  console.log("\n📈 [Step 1/4] Computing git churn...");

  try {
    const raw = execSync("git log --all --format= --name-only", {
      encoding: "utf-8",
      maxBuffer: 100 * 1024 * 1024,
    });

    const srcNorms = srcDirs.map(d => norm(d));
    const counts = new Map();
    for (const line of raw.split("\n")) {
      const f = line.trim();
      if (!f) continue;
      const rel = norm(f);
      for (const srcNorm of srcNorms) {
        if (rel.startsWith(srcNorm)) {
          const inner = rel.substring(srcNorm.length).replace(/^\//, "");
          if (isSourceFile(inner) && !isTestFile(inner)) {
            counts.set(inner, (counts.get(inner) || 0) + 1);
          }
          break;
        }
      }
    }

    const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
    console.log(
      "  ✅ Found %d source files with git history.",
      sorted.length
    );
    return sorted;
  } catch (err) {
    console.error("  ❌ Failed to compute churn:", err.message);
    return [];
  }
}

// ──────────────────────────────────────────────────────────────
// STEP 2: STATIC IMPORT ANALYSIS — Java FQN -> Path
// ──────────────────────────────────────────────────────────────

function computeCoupling(srcDirs) {
  console.log("\n🔗 [Step 2/4] Analyzing static imports & coupling...");

  // Discover all source files across all source directories
  const allSourceFiles = new Set();
  const sourceFiles = new Set();

  function walk(dir, baseDir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (EXCLUDE_DIRS.has(entry.name)) continue;
        walk(full, baseDir);
        continue;
      }
      if (!entry.isFile() || !isSourceFile(full)) continue;
      const rel = norm(path.relative(baseDir, full));
      allSourceFiles.add(rel);
      if (!isTestFile(rel)) {
        sourceFiles.add(rel);
      }
    }
  }
  for (const sd of srcDirs) {
    walk(sd, sd);
  }
  console.log("  Discovered %d source files (%d non-test).", allSourceFiles.size, sourceFiles.size);

  // Build reverse import map: source_file -> Set of files it imports
  // Only track imports from non-test files into non-test files
  const importMap = {};
  sourceFiles.forEach((f) => { importMap[f] = new Set(); });

  // Count incoming imports per target
  const incomingCount = {};
  sourceFiles.forEach((f) => { incomingCount[f] = 0; });

  const aliasToFile = new Map();
  for (const filePath of allSourceFiles) {
    for (const alias of buildAliases(filePath)) {
      if (!aliasToFile.has(alias)) aliasToFile.set(alias, filePath);
    }
  }

  function resolveImport(token, currentFile) {
    const normalized = token.replace(/::/g, "/");
    const dotNormalized = token.replace(/\./g, "/");
    const candidates = new Set([token, normalized, dotNormalized, stripSourceExtension(normalized), stripSourceExtension(dotNormalized)]);

    const currentDir = path.posix.dirname(currentFile);
    if (token.startsWith(".") || token.startsWith("/")) {
      const rel = norm(path.posix.join(currentDir, token));
      candidates.add(rel);
      candidates.add(stripSourceExtension(rel));
    }

    for (const candidate of [...candidates]) {
      if (aliasToFile.has(candidate)) return aliasToFile.get(candidate);
      const parts = splitPathSegments(candidate);
      for (let i = 0; i < parts.length; i++) {
        const suffix = parts.slice(i).join("/");
        if (aliasToFile.has(suffix)) return aliasToFile.get(suffix);
      }
    }

    return null;
  }

  // Parse imports from each source file — try all source dirs to find it
  let importStats = { totalLines: 0, matchingImports: 0, resolvedImports: 0 };
  for (const filePath of allSourceFiles) {
    let content;
    let found = false;
    for (const sd of srcDirs) {
      const full = path.join(sd, filePath.replace(/\//g, path.sep));
      try {
        content = fs.readFileSync(full, "utf-8");
        found = true;
        break;
      } catch { /* try next src dir */ }
    }
    if (!found) continue;

    const lang = langForFile(filePath);

    const lines = content.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      importStats.totalLines++;

      const candidates = extractImportCandidates(trimmed, lang);
      if (candidates.length === 0) continue;

      for (const rawToken of candidates) {
        importStats.matchingImports++;
        if (shouldSkipExternalImport(rawToken, lang)) continue;

        const target = resolveImport(rawToken, filePath);
        if (target && sourceFiles.has(target)) {
          importMap[filePath] = importMap[filePath] || new Set();
          importMap[filePath].add(target);
          incomingCount[target]++;
          importStats.resolvedImports++;
        }
      }
    }
  }

  console.log(
    "  Parsed %d lines, %d matching imports, %d resolved to project files.",
    importStats.totalLines,
    importStats.matchingImports,
    importStats.resolvedImports
  );

  // Count files with >0 incoming imports
  const withImports = Object.entries(incomingCount)
    .filter(([, c]) => c > 0)
    .sort((a, b) => b[1] - a[1]);
  console.log("  %d files have incoming internal imports.", withImports.length);

  return { importMap, incomingCount };
}

// ──────────────────────────────────────────────────────────────
// STEP 3: ZONE OF PAIN
// ──────────────────────────────────────────────────────────────

function computePainZones(sortedChurn, incomingCount) {
  console.log("\n⚡ [Step 3/4] Calculating Zone of Pain scores...");

  // Only score non-test source files that exist in both churn and coupling data
  const allFiles = new Set([
    ...sortedChurn.map((e) => e[0]),
    ...Object.keys(incomingCount),
  ]);

  const maxChurn = Math.max(...sortedChurn.map((e) => e[1]), 1);
  const maxCoupling = Math.max(...Object.values(incomingCount), 1);

  const scored = [];
  for (const f of allFiles) {
    // Skip test files
    if (isTestFile(f)) continue;

    const churn = sortedChurn.find((e) => e[0] === f)?.[1] || 0;
    const coupling = incomingCount[f] || 0;

    const nc = churn / maxChurn;
    const ni = coupling / maxCoupling;

    // Geometric mean: requires BOTH high churn AND high coupling to score high
    const pain =
      nc > 0 && ni > 0 ? Math.sqrt(nc * ni) : 0;

    scored.push({ file: f, churn, coupling, nc: +nc.toFixed(3), ni: +ni.toFixed(3), pain: +pain.toFixed(3) });
  }

  scored.sort((a, b) => b.pain - a.pain);

  const top15 = scored.filter(s => s.pain > 0).slice(0, 15);
  console.log(
    "  Generated pain scores for %d files (%d with pain > 0). Top 15 below.",
    scored.length,
    top15.length
  );
  return top15;
}

function renderPainTable(rankings) {
  let md = "| # | File | Churn | Coupling | Pain |\n";
  md += "|---|------|-------|----------|------|\n";

  for (let i = 0; i < rankings.length; i++) {
    const r = rankings[i];
    md += `| ${i + 1} | \`${r.file}\` | ${r.churn} | ${r.coupling} | ${r.pain.toFixed(3)} |\n`;
  }
  return md;
}

// ──────────────────────────────────────────────────────────────
// STEP 4: TEMPORAL COUPLING — co-modified files
// ──────────────────────────────────────────────────────────────

function computeTemporalCoupling(sortedChurn, topN = 5) {
  console.log(`\n🕰️  [Step 4/4] Analyzing temporal coupling (top ${topN} most unstable)...`);

  const targets = sortedChurn.slice(0, topN).map((e) => e[0]);
  const tSet = new Set(targets);

  // Also collect all non-test source files that might appear with targets
  const tSrcDirs = findAllSrcDirs();
  if (!tSrcDirs) {
    console.log("  ⚠️  Could not find source directory.");
    return "";
  }

  const allSourceSet = new Set();
  function walkAll(dir, baseDir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (EXCLUDE_DIRS.has(entry.name)) continue;
        walkAll(full, baseDir);
        continue;
      }
      if (!entry.isFile()) continue;
      const rel = norm(path.relative(baseDir, full));
      if (isSourceFile(rel) && !isTestFile(rel)) {
        allSourceSet.add(rel);
      }
    }
  }
  for (const sd of tSrcDirs) {
    walkAll(sd, sd);
  }

  console.log("  Tracking %d source files across all commits.", allSourceSet.size);

  try {
    const srcNorms = tSrcDirs.map(d => norm(d));

    // Use hash directly as separator — %H outputs exactly 40 hex chars
    // Each commit section: hash line, then file lines, then blank, then next hash
    const raw = execSync(
      'git log --all --format="COMMIT:%H" --name-only',
      { encoding: "utf-8", maxBuffer: 200 * 1024 * 1024 }
    );

    // Manual parsing: split on "COMMIT:" prefix followed by 40 hex chars
    const commits = [];
    let currentFiles = [];
    let inCommit = false;

    for (const line of raw.split("\n")) {
      const trimmed = line.trim();

      // Check for commit header
      if (trimmed.startsWith("COMMIT:")) {
        const hash = trimmed.substring(7).trim();
        // Valid git hash is exactly 40 hex chars
        if (/^[0-9a-fA-F]{40}$/.test(hash) && currentFiles.length > 0) {
          commits.push(currentFiles);
        }
        currentFiles = [];
        inCommit = true;
        continue;
      }

      if (!inCommit) continue;

      const f = trimmed;
      if (!f) continue;
      const rel = norm(f);
      let matched = false;
      let n = "";
      for (const sn of srcNorms) {
        if (rel.startsWith(sn)) {
          n = rel.substring(sn.length).replace(/^\//, "");
          matched = true;
          break;
        }
      }
      if (!matched) continue;
      // Only track non-test source files
      if (allSourceSet.has(n)) {
        currentFiles.push(n);
      }
    }
    // Last commit
    if (inCommit && currentFiles.length > 0) {
      commits.push(currentFiles);
    }

    console.log("  Analyzed %d commits for co-modification patterns.", commits.length);

    // Build co-occurrence map: for each target file, count how often other files appear in same commit
    const coMods = {};
    targets.forEach((t) => { coMods[t] = new Map(); });

    let coModifiedCount = 0;
    for (const commit of commits) {
      // Find which targets are in this commit
      const relevant = commit.filter((f) => tSet.has(f));
      if (relevant.length < 2) continue;

      coModifiedCount++;

      // All pairs of files in this commit that include at least one target
      const filesInCommit = new Set(commit);
      for (const target of targets) {
        if (!filesInCommit.has(target)) continue;
        for (const otherFile of commit) {
          if (otherFile === target) continue;
          const count = coMods[target].get(otherFile) || 0;
          coMods[target].set(otherFile, count + 1);
        }
      }
    }

    console.log(`  Found co-modifications in ${coModifiedCount} commits.`);

    // Render per target
    let md = "";
    for (const tFile of targets) {
      const churn = sortedChurn.find((e) => e[0] === tFile)?.[1] ?? "?";
      md += `### \`${tFile}\` (churn: ${churn})\n\n`;
      md += "Most frequently co-modified with:\n\n";

      const pairs = [...coMods[tFile].entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

      if (pairs.length === 0) {
        md += "  (none found)\n\n";
        continue;
      }

      md += "| File | Times co-modified |\n|------|----------|\n";
      for (const [f, c] of pairs) {
        md += `| \`${f}\` | ${c} |\n`;
      }
      md += "\n";
    }

    return md;
  } catch (err) {
    console.log("  ❌ Failed to analyze temporal coupling:", err.message);
    return "";
  }
}

// ──────────────────────────────────────────────────────────────
// MAIN
// ──────────────────────────────────────────────────────────────

function findAllSrcDirs() {
  const found = [];
  const root = process.cwd();
  function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      const fullPath = path.join(dir, entry.name);
      const relPath = norm(path.relative(root, fullPath));
      if (SRC_PATTERNS.some(p => relPath === p || relPath.endsWith("/" + p))) {
        found.push(relPath);
      }
      walk(fullPath);
    }
  }
  walk(root);
  // Remove parent dirs when a more specific subdir is present (e.g. keep src/main/java, drop src)
  const filtered = found.filter(f =>
    !found.some(other => other !== f && other.startsWith(f + "/"))
  );
  return filtered.length > 0 ? filtered : null;
}

function main() {
  console.log(
    "\n" +
    "╔═══════════════════════════════════════════════════════════════╗\n" +
    "║  ZONE-OF-PAIN ANALYZER v3 — Multi-module discovery           ║\n" +
    "║  Run: node zone-of-pain-analyzer.js                           ║\n" +
    "╚═══════════════════════════════════════════════════════════════╝\n"
  );

  const srcDirs = findAllSrcDirs();
  if (!srcDirs) {
    console.error("\n❌ No source directory found. Run from your project root.");
    process.exit(1);
  }
  console.log(`  Found ${srcDirs.length} source directories:`);
  for (const sd of srcDirs) {
    console.log(`    ${sd}`);
  }

  // Step 1: Churn
  const sortedChurn = computeChurn(srcDirs);
  if (sortedChurn.length === 0) {
    console.error("\n❌ No churn data found. Is this a git repository?");
    process.exit(1);
  }
  console.log(`  Top 5 by churn:`);
  for (const [f, c] of sortedChurn.slice(0, 5)) {
    console.log(`    ${c} commits → ${f}`);
  }

  // Step 2: Coupling
  const { importMap, incomingCount } = computeCoupling(srcDirs);

  // Step 3: Pain zones
  const painZones = computePainZones(sortedChurn, incomingCount);

  console.log("\n" + "=".repeat(72));
  console.log("  TOP 15 — ZONE OF PAIN FILES");
  console.log("  (Score = √(normalizedChurn × normalizedCoupling))");
  console.log("  Only non-test source files. Pain > 0 means BOTH churn AND coupling > 0.");
  console.log("=".repeat(72) + "\n");

  const tableMd = renderPainTable(painZones);
  console.log(tableMd);
  console.log(`  Legend: Churn = commit count, Coupling = # files importing this one.\n`);

  // Step 4: Temporal coupling
  console.log("=".repeat(72));
  console.log("  TEMPORAL COUPLING — Co-modified files");
  console.log("  (Files appearing together in the same commits)");
  console.log("=".repeat(72) + "\n");

  const temporalMd = computeTemporalCoupling(sortedChurn, 5);
  console.log(temporalMd || "  (no temporal data available)\n");

  // Summary
  console.log("=".repeat(72));
  console.log("  ✅ Analysis complete.");
  console.log("=".repeat(72) + "\n");

  // Write report — paths are already relative to each source root
  const outputFile = path.join(process.cwd(), "zone-of-pain.md");
  const fullMd = `# Zone of Pain - Architecture Analysis\n${tableMd}\n${temporalMd}`;
  fs.writeFileSync(outputFile, fullMd, "utf-8");
  console.log(`  Report saved to: ${outputFile}\n`);
}

main();
