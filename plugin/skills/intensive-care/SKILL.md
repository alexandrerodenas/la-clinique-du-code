---
name: intensive-care
description: Portable intensive care protocol from the Code Clinic. Operates only on critical and important findings, then stops when none remain.
---

# Intensive care protocol

Intensive care is an explicit path initiated only by the user. It alternates
read-only checkups with prescribed operations by the Surgeon, and stops as soon
as no actionable critical or important finding remains.

## Entry requirements

- The mode is initiated by an explicit command from the user.
- Use the scope provided by the user. If it is empty, use the current session's
work.
- Launching the command explicitly constitutes consent to operate on successive
prescriptions within that scope. It does not authorize expanding the scope or
treating anything outside the current prescription.

## Care loop

For each pass:

1. Run a **full checkup** in read-only mode with the same scope.
2. Wait for the report and isolate actionable 🔴 CRITICAL or 🟠 IMPORTANT
   findings that require a verifiable modification.
3. If none remain, stop operating and return the final assessment. Report any
   remaining 🟡 MODERATE or 🔵 MINOR findings as deferred; they do not trigger
   another operation or pass.
4. Send only the critical and important findings to the **Surgeon**. The
   explicit launch of intensive care provides consent for this prescription.
5. Wait for the Surgeon's report, reread the diff and review the validations.
6. If the Surgeon refuses, fails, makes no modification, cannot process the
   prescription or makes no progress, stop and report the blockage clearly.
   Do not claim success.
7. Otherwise, rerun a checkup with the same scope.

The report of each pass must be kept in the final report:
prescription received, operations carried out, checks, remaining findings and
reason for stopping.

## Guardrails

- Never launch the Surgeon before obtaining the checkup report.
- Do not operate on 🟡 MODERATE or 🔵 MINOR findings. A future, speculative or
non-actionable recommendation is not a reason to pursue surgery.
- Never expand the scope or treat an opportunistic improvement.
- Keep the 10-pass limit as a safety cap, not as a goal. Stop earlier as soon
as no actionable 🔴 CRITICAL or 🟠 IMPORTANT finding remains. If the cap is
reached, list the unresolved critical and important findings.
- A checkup remains strictly read-only; only the Surgeon can operate.
- If a checkup or intervention fails, do not ignore the error or claim success.
Stop and report the error and the known state.

## Final assessment

Provide a chronological report indicating:

- the perimeter;
- the number of passes;
- the prescription and operations of each pass;
- validations performed;
- the remaining findings, distinguishing actionable 🔴/🟠 items from deferred
🟡/🔵 observations;
- the reason for stopping: no actionable critical or important findings,
blockage, lack of progress or the 10-pass safety cap.
