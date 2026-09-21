---
description: Launches intensive care: checkup, prescribed surgery, then successive checkups until resolution or blockage.
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
2. Wait for the report and isolate only the actionable prescription: the
findings that require verifiable modification.
3. If it is empty, return the final assessment and stop treatment.
4. Otherwise, delegate this requirement to `surgeon`. It doesn't process anything else.
5. Wait for his report, reread the diff and validations.
6. If the sucker refuses, fails, produces no changes or reports a
prescription not treatable, stops with explicit blockage and without success
artificial.
7. Otherwise, rerun a checkup with the same scope.

Never skip the first checkup and never run the sucker in parallel with the
diagnosis. Do not turn a speculative recommendation into a transaction.
Stops after 10 passes maximum with remaining prescription and reason
stop. Provides a chronological assessment with prescriptions, operations,
validations, remaining findings and reason for stopping.
