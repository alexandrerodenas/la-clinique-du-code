---
description: Launches intensive care and operates only on critical and important findings.
agent: build
---

# 🏥 Intensive care at the Code Clinic

You coordinate the portable protocol `intensive-care` in build mode.
Start by reading the skill `intensive-care`, then apply it without changing the
code during checkups.

## Perimeter

The requested perimeter is: `$ARGUMENTS`.
If empty, uses work from the current session. Keep exactly this
perimeter throughout the loop.

## Mandatory protocol

For each pass, in this strict order:

1. Run a full read-only checkup, delegating `therapist` and
`diagnostician` in parallel as for `/checkup`.
2. Wait for the full report. Isolate only actionable 🔴 CRITICAL or
🟠 IMPORTANT findings that require a verifiable modification.
3. If no such finding remains, stop operating and return the final report.
Report remaining 🟡 MODERATE or 🔵 MINOR findings as deferred; they do not
trigger another operation or pass.
4. If findings remain, immediately delegate only those critical and important
findings to the `surgeon`. The explicit call of this command constitutes
consent for successive prescriptions within this scope; the surgeon must not
treat anything outside the prescription or operate on lower-severity findings.
5. Wait for the surgeon's report, reread the diff and validations.
6. If the surgeon refuses, fails, produces no changes or reports an
untreatable prescription, stop with an explicit blockage. Do not claim success.
7. Otherwise, return to a new checkup with the same scope.

Never skip the first checkup, run the surgeon in parallel with diagnosis or
turn a speculative recommendation into an operation. The 10-pass limit is a
safety cap, not a target: stop earlier as soon as no actionable 🔴/🟠 finding
remains. If the cap is reached, list unresolved critical and important
findings. Provide a chronological assessment with prescriptions, operations,
validations, remaining findings and reason for stopping.
