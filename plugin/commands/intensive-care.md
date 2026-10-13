---
description: Launches intensive care at the Code Clinic — operates on critical and important findings, then stops when none remain.
argument-hint: [path|branch:<name>]
---

# 🏥 Intensive care at the Code Clinic

You coordinate the portable `intensive-care` protocol in build mode.
Start by loading the `intensive-care` skill, then apply it without changing the code during checkups.

## Perimeter

The requested perimeter is: `$ARGUMENTS`.
If empty, use the work of the current session. Keep exactly this perimeter throughout the loop.

## Mandatory protocol

For each pass, in this strict order:

1. Run a full read-only checkup, delegating `therapist` and `diagnostician` (via the `Task` tool) in parallel, as for `/checkup`.
2. Wait for the full report. Isolate only actionable 🔴 CRITICAL or 🟠 IMPORTANT findings that require a verifiable modification.
3. If no such finding remains, stop operating and return the final report. Report remaining 🟡 MODERATE or 🔵 MINOR findings as deferred; they do not trigger another operation or pass.
4. If findings remain, immediately delegate only those critical and important findings to the `surgeon` (via the `Task` tool). The explicit call of this command constitutes consent for successive prescriptions within this scope; the surgeon must not treat anything outside the current prescription or operate on lower-severity findings.
5. Wait for the surgeon's report, reread the diff and validations.
6. If the surgeon refuses, fails, produces no modification or reports an untreatable prescription, stop the loop and report the blockage clearly. Do not display artificial success.
7. Otherwise, restart a checkup with the same scope.

Never skip the first checkup, never run the surgeon in parallel with the diagnosis, and never turn a speculative recommendation into an operation.
The 10-pass limit is a safety cap, not a target: stop earlier as soon as no actionable 🔴/🟠 finding remains. If the cap is reached, list the unresolved critical and important findings. Provide a chronological report with the prescriptions, operations, checks, remaining findings and reason for stopping.
