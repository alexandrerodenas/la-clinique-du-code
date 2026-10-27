---
description: "Security checkup of the Code Clinic. The Immunologist examines a change for reachable threats, each finding with an attack path."
agent: immunologist
---

# 🦠 Code Clinic Security Checkup

Read and apply the `immunologist` skill on the requested perimeter: `$ARGUMENTS`.
If empty, use the work from the current session. For `branch:<name>`, analyze
`git diff <base>...<name>` against the remote's default branch.

Never modify the code. If the user wants the findings treated, suggest
entrusting the report to the Surgeon (`surgeon`) as a prescription.
