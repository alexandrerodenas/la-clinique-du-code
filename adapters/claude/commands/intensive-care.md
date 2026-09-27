---
description: Launches intensive care at the Code Clinic — checkup, prescribed surgery, then successive checkups until resolution or blockage.
argument-hint: [path|branch:<name>]
---

# 🏥 Intensive care at the Code Clinic

You coordinate the portable `intensive-care` protocol in build mode.
Start by reading the `intensive-care` skill (`~/.claude/skills/intensive-care/SKILL.md`), then apply it without changing the code during checkups.

## Perimeter

The requested perimeter is: `$ARGUMENTS`.
If empty, use the work of the current session. Keep exactly this perimeter throughout the loop.

## Mandatory protocol

For each pass, in this strict order:

1. Run a full read-only checkup, delegating `therapist` and `diagnostician` (via the `Task` tool) in parallel, as for `/checkup`.
2. Wait for the full report. Isolate only its actionable prescription: findings that require a verifiable modification.
3. If no actionable prescription remains, return the final report and stop.
4. If it is not empty, immediately delegate this prescription to the `surgeon` (via the `Task` tool). The explicit call of this command constitutes consent for the successive prescriptions within this scope; the surgeon must not treat anything outside of the current prescription.
5. Wait for the surgeon's report, reread the diff and validations.
6. If the surgeon refuses, fails, produces no modification or reports an untreatable prescription, stop the loop and report the blockage clearly. Do not display artificial success.
7. Otherwise, restart a checkup with the same scope.

Never skip the first checkup, never run the surgeon in parallel with the diagnosis, and never turn a speculative recommendation into an operation.
Stop after 10 passes maximum with the remaining prescription and reason for stopping if the loop is not completed. Provide a chronological report with the prescriptions, operations, checks, remaining findings and reason for stopping.
