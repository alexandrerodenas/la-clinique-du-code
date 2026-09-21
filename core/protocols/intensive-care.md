---
name: intensive-care
description: Portable intensive care protocol from the Code Clinic. Follows checkup and surgery until no actionable prescription remains.
---

# Intensive care protocol

Intensive care is an explicit path, initiated only by the user.
They carry out a read-only checkup and an intervention by the Surgeon, then
start again until the last checkup no longer contains a prescription
actionable.

## Entry requirements

- The mode is initiated by an explicit command from the user.
- The perimeter is that provided when ordering; if it is empty, use it
scope of the current session.
- The explicit launch constitutes consent to carry out the prescriptions
successive prescriptions in this area. This consent does not allow
to broaden the scope or treat anything other than the current prescription.

## Care loop

For each pass:

1. Runs a **full checkup** in read-only mode, with the same scope.
2. Wait for its report and isolate only actionable recommendations:
the findings which prescribe a verifiable modification.
3. If no actionable prescription remains, stop treatment and return the
final assessment.
4. Send this prescription to the **Surgeon** with explicit consent
provided by intensive care mode.
5. The Surgeon only operates the prescribed batches, checks each batch and returns
his report.
6. If the Surgeon refuses, fails, does not produce any modification or reports
that it cannot process the prescription, stops the loop and reports
clearly the blockage.
7. Otherwise, rerun a checkup with the same scope.

The report of each pass must be kept in the final report:
prescription received, operations carried out, checks, remaining findings and
reason for stopping.

## Guardrails

- Never launch the Surgeon before obtaining the checkup report.
- Do not consider a future, speculative or non-actionable recommendation as
a reason to pursue surgery.
- Never expand the scope or treat an opportunistic improvement.
- Stops the loop after 10 passes maximum to avoid endless recursion.
In this case, indicates that the patient remains to be seen and lists the prescription
remaining.
- A checkup remains strictly without modification; only the surgeon can operate.
- If a checkup or intervention fails, do not ignore the error and do not display
of success: stops the treatment with the error and the state known.

## Final assessment

Provide a chronological report indicating:

- the perimeter;
- the number of passes;
- the requirements and operations of each pass;
- validations performed;
- the remaining findings;
- the reason for stopping: healthy patient, blockage, lack of progress or limit of
passes reached.
