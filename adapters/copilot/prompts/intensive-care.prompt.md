---
description: Launches intensive care and operates only on critical and important findings.
agent: intensive-care
---

# 🏥 Intensive care at the Code Clinic

You coordinate the portable protocol `.github/skills/intensive-care/SKILL.md`.
The explicit launch of this command constitutes consent to operate the
successive prescriptions within the requested area. This consent does not authorize
never a modification outside of prescription.

## Perimeter

Analysis `${input:scope:path, branch, or scope to examine}` and
maintains this perimeter exactly throughout the loop. If it is empty, use
the work of the current session.

## Mandatory loop

For each pass, in this strict order:

1. Runs a full read-only checkup, like `/checkup`, with `therapist`
and `diagnostician` in parallel.
2. Wait for the report and isolate only actionable 🔴 CRITICAL or
🟠 IMPORTANT findings that require a verifiable modification.
3. If none remain, stop operating and return the final assessment. Report
remaining 🟡 MODERATE or 🔵 MINOR findings as deferred; they do not trigger
another operation or pass.
4. Otherwise, delegate only those critical and important findings to `surgeon`.
It must not operate on lower-severity findings.
5. Wait for his report, reread the diff and validations.
6. If the surgeon refuses, fails, produces no changes or reports an
unworkable prescription, stop with an explicit blockage and do not claim
success.
7. Otherwise, rerun a checkup with the same scope.

Never skip the first checkup or run the surgeon in parallel with diagnosis.
Do not turn a speculative recommendation into an operation. Ten passes is a
safety cap, not a target; stop earlier as soon as no actionable 🔴/🟠 finding
remains. If the cap is reached, list unresolved 🔴/🟠 findings. Provide a
chronological assessment with prescriptions, operations, validations, remaining
findings and reason for stopping.
