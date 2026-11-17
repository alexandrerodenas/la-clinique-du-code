---
name: checkup
description: The Code Clinic checkup — the general practitioner's assessment. Resolves the scope (working tree, path or branch diff), dispatches the Code Therapist and the Test Diagnostician in parallel, read-only, and merges their reports into one clinical report with finding IDs, a verdict and a prioritized prescription. Use when the user runs /checkup or explicitly asks for a Code Clinic checkup.
---

# Checkup — The general practitioner's assessment

You coordinate a checkup. Two practitioners examine the patient file, you
merge their findings into one report, and the user decides what to treat.
**Nothing is modified during a checkup**, not by you, not by them.

## Step 1 — Open the patient file (scope)

Resolve the scope from the arguments, then keep it identical for the whole
consultation:

| Argument | Scope |
|---|---|
| *(empty)* | The work of the current session. If you did not write code in this session, use the uncommitted changes (`git status --porcelain`, `git diff HEAD`). If the tree is clean and there is no session work, ask the user what to examine. |
| `<path>` (one or more) | Those files or folders, as they are in the working tree. |
| `branch:<name>` | The diff of the branch against its base (see below). |

**Branch mode.** Find the base without network access:
`git symbolic-ref --short refs/remotes/origin/HEAD` (e.g. `origin/main`), else
`main`, else `master`. Then `git diff --name-only <base>...<name>` lists the
files and `git diff <base>...<name>` gives the change. If the branch does not
exist locally or the diff is empty, tell the user and stop.

Then gather, for the practitioners:

- the **files in scope** and the **test files** that exercise them (same name
  with `test`/`spec`, the nearest `test`/`tests`/`__tests__` folder, or tests
  importing the files in scope);
- the **project context**: type (prototype, internal tool, product, critical
  service, library, legacy), from the README, manifests, CI and history;
- the **functional contract**, if one exists: the user's original request in
  this session, a linked specification, ticket or acceptance criteria. Do not
  invent one.

## Step 2 — Dispatch the practitioners in parallel

Launch both subagents **in the same turn** with your harness's delegation tool
(`Task` in Claude Code, `task` in OpenCode, the agent tool in Copilot):

- **`therapist`** — files in scope (or the diff), project context, and the
  functional contract verbatim, or the words "no contract available".
- **`diagnostician`** — the test files in scope, the production files they
  cover, and the project context. If the scope has no tests, still dispatch
  it: missing tests on new behavior is a finding.

Subagents cannot ask the user questions, so give them everything they need in
the brief: explicit file lists, the base for a branch diff, and the context.

## Step 3 — Merge the reports

Wait for both reports. Then:

- keep each practitioner's IDs (`T1…`, `D1…`) so the user can approve a subset;
- drop exact duplicates (same location, same problem) and keep the more severe;
- keep items marked "for the Nutritionist" or "for the Immunologist" in a
  referral line — do not dispatch those experts yourself;
- do not upgrade or downgrade a practitioner's severity without saying why.

## Step 4 — Report

```text
## 🏥 Checkup report — The Code Clinic

### Patient file
- Scope: <paths, or branch X vs base Y> (<n> files, <m> test files)
- Context: <type> — <why, one line>
- Contract: <source> | none available

### Overall verdict
✅ Healthy — nothing blocking | ⚠️ Care needed — address before the next iteration | ❌ Hospitalization — 🔴 findings to treat now

### Spec compliance
<met / evidence-backed mismatches (cite requirement + location) / **not assessed**>

### Findings (most severe first)
| ID | Severity | Where | Finding | Trade-off |
|---|---|---|---|---|
| T1 | 🔴 | src/a.ts:42 | … | S · low · … |
| D1 | 🟠 | tests/a.test.ts:10 | … | S · low · … |

<then the full detail of each 🔴/🟠 finding, as written by the practitioner;
🟡/🔵 findings stay in the table only>

### Strengths
<1–3 items, from both practitioners>

### Referrals
<items for the Nutritionist / Immunologist / Radiologist, or "none">

### Prescription (proposed)
<ordered list of IDs to treat, most valuable first, with the reason>
To operate: "operate all", or "operate T1, D1" — the Surgeon treats only those.
```

## Rules

- Read-only. Never modify code, tests or configuration during a checkup, and
  never call the Surgeon from a checkup.
- Every finding keeps its location and severity; a finding without a location
  is dropped.
- Be honest about the verdict: ✅ is a good outcome, not a failure to find
  something. Do not pad the report.
- A checkup is an invitation to act, not an obligation. End by offering the
  Surgeon handoff; the user decides.
