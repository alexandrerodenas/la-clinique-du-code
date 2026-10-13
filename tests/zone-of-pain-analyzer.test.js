"use strict";

const assert = require("assert");
const { execFileSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const analyzerPath = path.resolve(
  __dirname,
  "..",
  "core",
  "tools",
  "zone-of-pain-analyzer.js"
);
const repository = fs.mkdtempSync(path.join(os.tmpdir(), "clinic-zone-of-pain-"));

function removeDirectory(directory) {
  if (typeof fs.rmSync === "function") {
    fs.rmSync(directory, { recursive: true, force: true });
    return;
  }

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      removeDirectory(entryPath);
    } else {
      fs.unlinkSync(entryPath);
    }
  }
  fs.rmdirSync(directory);
}

try {
  const git = (args) => execFileSync("git", args, { cwd: repository, stdio: "ignore" });
  const sourceDir = path.join(repository, "source");

  git(["init", "--quiet"]);
  fs.mkdirSync(sourceDir);
  fs.writeFileSync(path.join(sourceDir, "module.js"), "export const value = 1;\n");
  fs.writeFileSync(
    path.join(sourceDir, "consumer.js"),
    "import { value } from './module.js';\nconsole.log(value);\n"
  );
  git(["add", "source"]);
  git([
    "-c",
    "user.name=Code Clinic Test",
    "-c",
    "user.email=clinic@example.invalid",
    "commit",
    "--quiet",
    "-m",
    "fixture",
  ]);

  const output = execFileSync(process.execPath, [analyzerPath], {
    cwd: repository,
    encoding: "utf8",
  });

  assert.ok(/Found 1 source directories:[\s\S]*\n\s+source\n/.test(output));
  assert.ok(/1 resolved to project files/.test(output));
  assert.ok(/`module\.js`/.test(output));
  assert.strictEqual(fs.existsSync(path.join(repository, "zone-of-pain.md")), false);
  console.log("zone-of-pain analyzer source/ and read-only checks passed.");
} finally {
  removeDirectory(repository);
}
