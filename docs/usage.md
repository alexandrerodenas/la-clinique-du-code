# 🧭 Usage

The same commands exist in every adapter (Claude Code, OpenCode, GitHub
Copilot). Each one takes an optional scope:

| Scope | Examined |
|---|---|
| *(empty)* | the work of the current session, else the uncommitted changes |
| `src/billing` (one or more paths) | those files, as they are |
| `branch:feature/x` | the branch's diff against the default branch (`origin/HEAD`, else `main`, else `master`) — the branch must exist locally |

## `/checkup` — the general practitioner

```bash
/checkup
/checkup src/billing
/checkup branch:feature/invoices
```

1. The Clinic opens the patient file: files in scope, their tests, the project
   context, and the functional contract (your original request or acceptance
   criteria) when there is one.
2. The **Code Therapist** and the **Test Diagnostician** examine it in
   parallel, read-only. The Diagnostician may run the relevant tests to
   measure them; it never updates snapshots or writes files.
3. You get one report: verdict (✅ healthy · ⚠️ care needed · ❌
   hospitalization), spec compliance (or *not assessed*), a findings table
   with IDs, and a proposed prescription.

```text
| ID | Severity | Where              | Finding                               | Trade-off     |
|----|----------|--------------------|---------------------------------------|---------------|
| T1 | 🔴       | src/invoice.ts:42  | Rounding applied before tax           | S · low · …   |
| D1 | 🟠       | tests/invoice.test.ts:10 | Expected value rebuilt with the same formula (tautology) | S · low · … |
```

> ⚠️ Golden rule: **no operation during a checkup.** Practitioners diagnose
> and prescribe; you decide.

## Operating: the Surgeon

Approve all or part of a prescription, by ID:

```text
operate all
operate T1 and D1
have the surgeon treat X2 from the security checkup
```

The Surgeon takes a baseline (uncommitted changes, current test results),
operates batch by batch, verifies each batch against the baseline, reverts a
batch it cannot make pass, and returns a post-operative report listing every
change. It refuses to operate without a Clinic prescription and your explicit
consent, and never treats more than what you approved.

## `/security-checkup` — the Immunologist

```bash
/security-checkup branch:feature/upload
```

Maps the entry points the change touches, runs cheap scanners if installed
(gitleaks, semgrep, dependency audits — nothing is installed for you), and
reports only threats an attacker can reach. Every finding has an
`attack: who → entry point → what they get` line; nothing reachable means
`✅ clean`, and that is a good outcome.

## `/intensive-care` — the loop (alias `/soins-intensifs`)

```bash
/intensive-care src/billing
/soins-intensifs branch:feature/invoices
```

The only mode that chains diagnosis and surgery without asking in between,
so it is strictly opt-in: running the command is consent to operate on the
🔴 CRITICAL and 🟠 IMPORTANT findings of each pass, within the scope — nothing
else.

Each pass: checkup → keep the actionable 🔴/🟠 findings → Surgeon → review.
It stops as soon as none remain, when the Surgeon refuses or fails, when a
check regresses, when the same finding comes back (no progress), or at
pass 10. 🟡/🔵 findings are reported as deferred and never operated. The final
report lists every pass, what was treated, and why it stopped.

## On-demand experts

```text
ask the radiologist for this repository's zone of pain
x-ray src/ since 6 months ago
have the nutritionist check whether src/plugins is still needed
ask the therapist to review src/parser.ts against the acceptance criteria in ISSUE.md
```

- The **Radiologist** runs a read-only analyzer on the git history:
  pain zones (files that change often *and* that many files import), the most
  unstable files, and temporal coupling — files that change together without
  importing each other. It ends with the 1–3 files the Therapist should
  examine first. You can run the analyzer yourself:
  `node core/tools/zone-of-pain-analyzer.js --since "12 months ago"`
  (`--path`, `--top`, `--temporal`, `--json`, `--help`).
- The **Nutritionist** establishes the real uses of the code before judging
  it, then reports dead code, speculation, over-engineering and reinvented
  wheels, each with a confidence level.

## The contract

The Clinic never starts on its own. After significant work your assistant may
ask, in one sentence:

> "The feature is done. Would you like a Code Clinic checkup before you commit?"

It's up to you.
