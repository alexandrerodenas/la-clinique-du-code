# Changelog

## Unreleased

### Removed
- The `/soins-intensifs` alias (Claude Code, OpenCode and Copilot command,
  prompt and extension entries). Use `/intensive-care`, consistent with
  `/checkup` and `/security-checkup`. The installer does not prune files it no
  longer ships: after a manual install, delete `commands/soins-intensifs.md`
  (Claude Code, OpenCode) or `.github/prompts/soins-intensifs.prompt.md`
  (Copilot) by hand.

### Protocols
- Code Therapist: new *Mutation rules*, cited by ID in findings, each with its
  expected fix and the null pointer risk it carries — `MUT-1` local declared
  without a value then assigned in branches (🟠), `MUT-2` reassignment after
  declaration, loops and justified accumulators excepted (🟡, 🟠 when
  nullable or in a branch), `MUT-3` duplicate declaration or computation left
  by a refactoring (🟠), `MUT-4` throwing final `else`, merged with *Late
  guards* into a single finding. Any `MUT-*` escalates to 🔴 when a real path
  can dereference the unset value.
- Nutritionist: refactoring leftovers and dead stores join the *Dead code*
  lens, reported under `MUT-3` (🔴 when the leftover reads an input that
  became optional).
- Test Diagnostician: the absent-input path of a variable assigned in
  branches needs its own test; new *Mutation in the test* check (a reassigned
  `result` means two behaviors in one test).
- Code Therapist: new *Control flow* lens and three house smells generated
  code produces often — late guards (a final `else` that only throws),
  useless `else`/`elif` after `return`/`throw`, and ceremonial `try`/`catch`
  (a catch that neither recovers, translates at a boundary nor releases a
  resource). 🟡 by default, reported as one finding per file or theme.
- Nutritionist: new *Defensive overdose* lens — superfluous `try`/`catch` and
  checks for states that cannot happen (🟡, 🟠 when the catch also hides the
  failure or the wrapping spans a whole layer).
- Test Diagnostician: every guard clause needs its error-path test; new
  *Exceptions and control flow* check — framework exception assertions instead
  of hand-written `try`/`fail`/`catch`, a `try`/`catch` that swallows the
  assertion error is tautological (🟠), no conditional logic in a test.

## 1.1.0

### Architecture
- `core/` is now the single source of truth for practitioners too:
  `core/agents/*.md` (persona + access level) are rendered by
  `scripts/build.mjs` into Claude Code, OpenCode and Copilot agents. The
  previous hand-maintained copies had drifted (e.g. the OpenCode Diagnostician
  could not run tests).
- New portable `checkup` protocol: scope resolution, parallel dispatch, merge
  rules and report format now live in one skill instead of being duplicated in
  every adapter's command. Commands are thin wrappers.
- `scripts/build.mjs` replaces `scripts/sync-plugin-protocols.mjs`
  (`--check` also detects orphaned generated files).
- Cross-platform installer `scripts/install.mjs` (claude, opencode, copilot;
  `--dry-run`, `--uninstall`). The PowerShell scripts are thin wrappers. The
  Copilot install no longer overwrites an existing `copilot-instructions.md`.
- `npm test` and a CI workflow (Linux, macOS, Windows).
- `/security-checkup` everywhere, including the Copilot extension (command,
  tool and coordinator agent).

### Protocols
- Shared contract in `core/clinic-principles.md`: one severity scale, one
  finding format with IDs (`T`, `D`, `R`, `N`, `X`) and mandatory locations.
- Users can approve a prescription by ID (`operate T1, D2`).
- Subagents no longer ask questions they cannot ask: they infer, state their
  assumptions, and lower their confidence.
- Code Therapist: half the size — generic pattern and principle catalogs
  removed, house smells and calibration kept, correctness lens added.
- Test Diagnostician: behavior → test mapping, mutation-style check of
  assertions, 🔴 level, safe test commands (no snapshot updates).
- Nutritionist: dynamic-use verification before declaring code dead,
  confidence per finding.
- Surgeon: test baseline before operating, one repair attempt then revert,
  structured post-operative report, never commits on its own.
- Intensive care: baseline, explicit no-progress detection, pass table.
- Immunologist: fixed scanner invocations, no live exploitation.
- Radiologist: interpretation guide and report format.
- Claude Code subagents preload their skill (`skills:`) and have the `Skill`
  tool; previously they were told to load a skill without access to it.

### Zone-of-pain analyzer v4
- Repository-relative paths (monorepo files with the same name were merged).
- Works on repositories without a `src/`-like folder (Go, Python at root…).
- Tracked files only (`git ls-files`), current branch history, renames ignored.
- Better test detection (`test_x.py`, `__tests__/`; `latest.js` is no longer a test).
- Coupling counts distinct importing files; resolves multi-line JS imports,
  `require`, Python relative imports, Go packages, Rust `crate::`, PHP `use`.
- Temporal coupling ignores mass commits and flags pairs without import link.
- Options: `--since`, `--path`, `--top`, `--temporal`, `--json`, `--help`.
