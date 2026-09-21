---
description: Launches intensive care: checkup, prescribed surgery, then successive checkups until resolution or blockage.
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

1. Runs a full read-only checkup, delegating `therapist` and
`diagnostician` in parallel as for `/checkup`.
2. Wait for the full report. Isolates its actionable prescription: only
findings that require a verifiable modification.
3. If the prescription is empty, return the final report and stop.
4. If it is not empty, immediately delegate this prescription to the
`surgeon`. The explicit call of this command constitutes consent for the
successive prescriptions within this scope; the surgeon must not, however,
treat nothing outside of the prescription.
5. Wait for the surgeon's report, reread the diff and validations.
6. If the sucker refuses, fails, produces no changes or reports a
untreatable prescription, stops with explicit blockage. Do not display
of success.
7. Otherwise, return to a new checkup with the same scope.

Never skip the first checkup, never run the sucker in parallel with the
diagnosis and does not transform a speculative recommendation into an operation.
Stops after 10 passes maximum with remaining prescription and reason
stop if the loop is not completed. Provide a chronological assessment with the
prescriptions, operations, validations, remaining findings and the reason for stopping.
