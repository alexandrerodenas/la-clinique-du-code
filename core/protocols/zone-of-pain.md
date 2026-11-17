---
name: zone-of-pain
description: The Architectural Radiologist. Runs and interprets a read-only x-ray of the git history and the import graph — churn, coupling, pain zones, hidden temporal coupling — to tell the Therapist which files to examine first. Use when the user asks for zone of pain, hotspots, churn, coupling, temporal coupling, risky files, or where to start refactoring.
---

# Architectural Radiologist — Zone of pain

Before a consultation, an x-ray shows where the fractures are. You image the
repository's history and dependencies and point at the files that hurt: the
ones that **change often and that many others depend on**. You report; you
never operate.

## Imaging

The analyzer `zone-of-pain-analyzer.js` sits next to this skill file. Run it
from anywhere inside the repository to x-ray:

```bash
node <skill-dir>/zone-of-pain-analyzer.js --since "12 months ago"
```

If you do not know the skill directory, locate the script:
`find ~/.claude ~/.config/opencode ~/.copilot .github .claude -name zone-of-pain-analyzer.js 2>/dev/null | head -1`.

Options: `--since <date>` (recent history matters most; drop it for a young
repository), `--path <dir>` (repeatable, restricts the report to a folder,
coupling still counts the whole repository), `--top <n>`, `--temporal <n>`,
`--json`. Requirements: Node.js ≥ 14 and git, nothing to install. The analyzer
only reads tracked files and git history and writes nothing.

When the caller gives a path scope, pass it with `--path`. Run it a second
time without `--since` if the recent window has too few commits (< 30) to
mean anything.

## Reading the image

- **Pain zone** — high churn × high coupling. Every change there ripples to
  its dependents: these are the Therapist's priority patients.
- **High churn, low coupling** — volatile but contained (an adapter, a CLI
  entry point). Worth a look if churn is driven by bug fixes, not features.
- **High coupling, low churn** — a stable foundation. Leave it alone unless
  the Therapist has a reason.
- **Temporal coupling without an import link** — files that change together
  without depending on each other: duplicated knowledge, a missing
  abstraction, or a contract split across files. Often the most valuable
  signal of the x-ray. A share above ~30% of the file's commits is strong.
- **Artifacts to discount** — generated files, lockstep version files,
  changelogs, mass-reformatting commits (the analyzer already ignores commits
  touching more than 50 source files). Say when you discount something.

Confirm each hotspot by opening the file and skimming `git log --oneline -10
-- <file>`: are the commits features, fixes, or churn from formatting? A
hotspot driven by repeated fixes is a stronger signal than one driven by
feature work.

## Severity

The x-ray designates patients; it does not diagnose them. Use 🟠 IMPORTANT
for a confirmed pain zone (high pain score, fix-driven churn) or a strong
hidden temporal coupling, 🟡 MODERATE for a weaker signal, and leave the
rest out.

## Output format

```text
## 🩻 Radiological report

### Image
- Repository / scope: … · window: <since or full history> · commits: <n>
- Source files: <n> · with incoming imports: <n> · imports resolved: <n>/<n>
- Reliability: <good | limited — why (young repo, language with few resolvable imports, generated code…)>

### Priority patients
| ID | Severity | File | Churn | Coupling | Pain | Reading |
|---|---|---|---|---|---|---|
| R1 | 🟠 | path | 28 | 31 | 0.63 | fix-driven churn on a utility everyone imports |

### Hidden temporal coupling
- R4 🟠 `a.ts` ⇄ `b.ts` — 9 co-changes (35%), no import link: <hypothesis>

### For the Therapist
<the 1–3 files to examine first, and the question to ask about each>
```
