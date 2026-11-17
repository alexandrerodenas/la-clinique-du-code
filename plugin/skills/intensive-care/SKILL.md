---
name: intensive-care
description: The Code Clinic intensive care loop. Alternates read-only checkups with Surgeon operations on actionable 🔴 CRITICAL and 🟠 IMPORTANT findings only, and stops as soon as none remain, on failure, refusal or lack of progress, or at the 10-pass safety cap. Use only when the user explicitly runs /intensive-care or /soins-intensifs.
---

# Intensive care

An explicit, opt-in loop: checkup → Surgeon → checkup, until no actionable
🔴/🟠 finding remains. It is the only mode that chains diagnosis and surgery
without asking in between, so its guardrails are strict.

## Entry

- Started only by an explicit command from the user. Never suggest it as an
  automatic next step and never start it yourself.
- **Scope**: resolve it exactly as the `checkup` protocol does (empty =
  current session's work or uncommitted changes; `<path>`; `branch:<name>`),
  then keep it identical for every pass.
- **Consent**: launching the command is consent to operate on the 🔴/🟠
  findings of each pass, within that scope. It never authorizes widening the
  scope, treating 🟡/🔵 findings, or opportunistic changes.
- **Baseline**: record `git status --short` and the current state of the
  project's checks before the first pass, so the final report can separate
  the loop's changes from what was already there.

## Care loop

For each pass `n` (1 ≤ n ≤ 10):

1. **Checkup.** Run the `checkup` protocol, read-only, on the scope: the
   Therapist and the Diagnostician in parallel, one merged report.
2. **Triage.** Keep only 🔴 CRITICAL and 🟠 IMPORTANT findings that are
   actionable: a concrete, verifiable code change within the scope. A
   speculative, future-facing or "consider…" recommendation is not actionable.
3. **Stop if none remain.** Report the remaining 🟡/🔵 findings as deferred;
   they never trigger an operation or another pass.
4. **Progress check** (from pass 2). If a finding from the previous pass's
   prescription is reported again (same problem in the same file — IDs and
   line numbers may change between passes), the loop is not progressing on
   it: stop and report it as blocked. Do not re-prescribe it.
5. **Operate.** Send exactly the actionable 🔴/🟠 findings to the `surgeon`,
   with their IDs, locations and recommendations, and the note that consent
   comes from intensive care. Never run the Surgeon in parallel with a
   checkup.
6. **Review.** Read the Surgeon's report and the diff. If it refused, failed,
   changed nothing, or regressed a check compared with the baseline: stop and
   report the blockage. Never claim success.
7. **Next pass** with the same scope.

At pass 10, stop regardless and list the unresolved 🔴/🟠 findings. Ten is a
safety cap, not a target: most patients leave after one or two passes.

## Final report

```text
## 🏥 Intensive care report

### Scope and baseline
<scope> · baseline: <checks and pre-existing failures, pre-existing changes>

### Passes
| Pass | 🔴/🟠 prescribed | Treated | Not treated | Checks after |
|---|---|---|---|---|
| 1 | T1, T2, D1 | T1, D1 | T2 (reason) | tests ✅ |
| 2 | — | — | — | — |

### Outcome
Reason for stopping: no actionable 🔴/🟠 left | blocked (<what>) | no progress on <IDs> | 10-pass cap
Remaining 🔴/🟠: <IDs and titles, or "none">
Deferred 🟡/🔵: <IDs and titles>

### Changes
<files changed by the loop, separate from pre-existing changes>
```
