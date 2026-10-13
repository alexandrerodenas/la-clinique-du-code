#!/usr/bin/env node
"use strict";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const protocolsDir = path.join(root, "core", "protocols");
const skillsDir = path.join(root, "plugin", "skills");
const analyzerSource = path.join(root, "core", "tools", "zone-of-pain-analyzer.js");
const analyzerTarget = path.join(skillsDir, "zone-of-pain", "zone-of-pain-analyzer.js");
const checkOnly = process.argv.includes("--check");
const unknownArgs = process.argv.slice(2).filter((arg) => arg !== "--check");

if (unknownArgs.length > 0) {
  console.error("Usage: node scripts/sync-plugin-protocols.mjs [--check]");
  process.exit(2);
}

const normalize = (content) => content.replace(/\r\n/g, "\n");

const outputs = [];

for (const entry of fs.readdirSync(protocolsDir).filter((name) => name.endsWith(".md")).sort()) {
  const sourcePath = path.join(protocolsDir, entry);
  const targetPath = path.join(skillsDir, path.basename(entry, ".md"), "SKILL.md");
  const expected = normalize(fs.readFileSync(sourcePath, "utf8"));
  outputs.push({ targetPath, expected });
}

outputs.push({
  targetPath: analyzerTarget,
  expected: normalize(fs.readFileSync(analyzerSource, "utf8")),
});

const stale = outputs.filter(({ targetPath, expected }) => {
  try {
    return normalize(fs.readFileSync(targetPath, "utf8")) !== expected;
  } catch (error) {
    if (error.code === "ENOENT") {
      return true;
    }
    throw error;
  }
});

if (checkOnly) {
  if (stale.length > 0) {
    for (const { targetPath } of stale) {
      console.error(`Out of sync: ${path.relative(root, targetPath)}`);
    }
    process.exitCode = 1;
  } else {
    console.log("Plugin skills and analyzer are synchronized with core.");
  }
} else {
  for (const { targetPath, expected } of stale) {
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, expected, "utf8");
    console.log(`Synchronized ${path.relative(root, targetPath)}`);
  }
  if (stale.length === 0) {
    console.log("Plugin skills and analyzer are already synchronized with core.");
  }
}
