import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const analyzerPath = path.join(root, "core", "tools", "zone-of-pain-analyzer.js");
const { analyze, extractImports, isSourceFile, isTestFile, parseArgs } = require(analyzerPath);

/** Creates a throwaway git repository; `history` is a list of commits, each a map path -> content. */
function makeRepo(history) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "clinic-zop-"));
  const git = (...args) => execFileSync("git", args, { cwd: dir, stdio: "ignore" });
  git("init", "--quiet");
  history.forEach((files, i) => {
    for (const [file, content] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true });
      fs.writeFileSync(path.join(dir, file), content);
    }
    git("add", "-A");
    git("-c", "user.name=Clinic", "-c", "user.email=clinic@example.invalid", "commit", "--quiet", "-m", `c${i}`);
  });
  return dir;
}

const cleanup = (dir) => fs.rmSync(dir, { recursive: true, force: true });

test("test files are recognized across ecosystems, without false positives", () => {
  for (const f of ["src/a.test.ts", "src/a.spec.js", "pkg/a_test.go", "tests/test_a.py", "test_a.py",
    "src/test/java/FooTest.java", "FooIT.java", "app/__tests__/a.js", "spec/models/user_spec.rb", "conftest.py"]) {
    assert.equal(isTestFile(f), true, f);
  }
  for (const f of ["src/latest.js", "src/contest.py", "src/attestation.ts", "src/Testimonial.java", "lib/protest.rb"]) {
    assert.equal(isTestFile(f), false, f);
  }
});

test("source files exclude tests, vendored, generated and declaration files", () => {
  assert.equal(isSourceFile("src/a.mjs"), true);
  assert.equal(isSourceFile("src/a.cts"), true);
  assert.equal(isSourceFile("src/a.d.ts"), false);
  assert.equal(isSourceFile("node_modules/x/index.js"), false);
  assert.equal(isSourceFile("vendor/lib.go"), false);
  assert.equal(isSourceFile("README.md"), false);
});

test("imports are extracted per language", () => {
  const js = extractImports(
    "import a from './a';\nimport {\n  b,\n} from '../b.js';\nconst c = require('./c');\nexport * from './d';\nawait import('./e');",
    "js",
  ).map((i) => i.spec);
  assert.deepEqual(js, ["./a", "../b.js", "./c", "./d", "./e"]);

  const py = extractImports("from .models import User\nimport pkg.mod as m, other", "python").map((i) => i.spec);
  assert.ok(py.includes(".models.User") && py.includes(".models") && py.includes("pkg.mod") && py.includes("other"));

  const go = extractImports('import (\n  "fmt"\n  alias "example.com/app/internal/store"\n)', "go");
  assert.deepEqual(go.map((i) => [i.spec, i.kind]), [["fmt", "package"], ["example.com/app/internal/store", "package"]]);

  assert.deepEqual(extractImports("import com.acme.billing.Invoice;", "jvm").map((i) => i.spec), ["com.acme.billing.Invoice"]);
  assert.deepEqual(extractImports("use crate::billing::invoice::Invoice;", "rust").map((i) => i.spec), ["crate::billing::invoice::Invoice"]);
});

test("argument parsing validates options", () => {
  assert.deepEqual(parseArgs(["--since", "6 months ago", "--path", "src", "--top", "3"]).scopes, ["src"]);
  assert.throws(() => parseArgs(["--top", "0"]), /positive integer/);
  assert.throws(() => parseArgs(["--nope"]), /Unknown option/);
});

test("pain zones need both churn and coupling, with repository-relative paths", () => {
  const dir = makeRepo([
    {
      "packages/a/src/index.js": "export const a = 1;\n",
      "packages/b/src/index.js": "export const b = 1;\n",
      "packages/a/src/consumer.js": "import { a } from './index.js';\n",
      "packages/a/src/other.js": "import { a } from './index';\n",
      "packages/a/src/index.test.js": "import { a } from './index.js';\n",
    },
    { "packages/a/src/index.js": "export const a = 2;\n", "packages/b/src/index.js": "export const b = 2;\n" },
    { "packages/a/src/index.js": "export const a = 3;\n" },
  ]);
  try {
    const report = analyze({ cwd: dir });
    assert.equal(report.stats.sourceFiles, 4, "the test file is excluded");
    const top = report.painZones[0];
    assert.equal(top.file, "packages/a/src/index.js", "monorepo files with the same name are not merged");
    assert.equal(top.churn, 3);
    assert.equal(top.coupling, 2, "importers are distinct files, tests excluded");
    assert.ok(!report.painZones.some((z) => z.file === "packages/b/src/index.js"), "no importer → no pain");
  } finally {
    cleanup(dir);
  }
});

test("works without a conventional source folder, and --path restricts the report", () => {
  const dir = makeRepo([
    { "main.py": "from app import service\n", "app/service.py": "VALUE = 1\n", "tools/x.py": "import app.service\n" },
    { "app/service.py": "VALUE = 2\n" },
  ]);
  try {
    const all = analyze({ cwd: dir });
    assert.equal(all.painZones[0].file, "app/service.py");
    assert.equal(all.painZones[0].coupling, 2);

    const scoped = analyze({ cwd: dir, scopes: ["tools"] });
    assert.equal(scoped.stats.sourceFiles, 1);
    assert.equal(scoped.painZones.length, 0);
  } finally {
    cleanup(dir);
  }
});

test("temporal coupling flags files that change together without importing each other", () => {
  const dir = makeRepo([
    { "src/order.ts": "export const o = 1;\n", "src/invoice.ts": "export const i = 1;\n", "src/log.ts": "export {};\n" },
    { "src/order.ts": "export const o = 2;\n", "src/invoice.ts": "export const i = 2;\n" },
    { "src/order.ts": "export const o = 3;\n", "src/invoice.ts": "export const i = 3;\n" },
  ]);
  try {
    const report = analyze({ cwd: dir, temporal: 2 });
    const order = report.temporalCoupling.find((t) => t.file === "src/order.ts");
    assert.ok(order, "order.ts is among the most unstable files");
    assert.deepEqual(order.coChangedWith.map((p) => [p.file, p.times, p.link]), [["src/invoice.ts", 3, "none"]]);
  } finally {
    cleanup(dir);
  }
});

test("the CLI is read-only and fails clearly outside a git repository", () => {
  const dir = makeRepo([{ "src/a.js": "import './b.js';\n", "src/b.js": "\n" }]);
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), "clinic-nogit-"));
  try {
    const before = fs.readdirSync(dir).sort();
    const output = execFileSync(process.execPath, [analyzerPath, "--json"], { cwd: dir, encoding: "utf8" });
    assert.equal(JSON.parse(output).stats.sourceFiles, 2);
    assert.deepEqual(fs.readdirSync(dir).sort(), before, "no file written");

    assert.throws(
      () => execFileSync(process.execPath, [analyzerPath], { cwd: outside, encoding: "utf8", stdio: "pipe" }),
      (error) => error.status === 1 && /Not a git repository/.test(error.stderr),
    );
  } finally {
    cleanup(dir);
    cleanup(outside);
  }
});
