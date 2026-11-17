---
description: "Code Clinic security checkup: the Immunologist reviews a change for threats an attacker can actually reach, each finding with an attack path. Read-only."
agent: immunologist
subtask: true
---

# 🦠 Code Clinic security checkup

Apply the `immunologist` skill in full on the requested scope: `$ARGUMENTS`.

- Empty: the uncommitted changes (`git diff HEAD`).
- `<path>`: those files as they are.
- `branch:<name>`: `git diff <base>...<name>`, with the base from
  `git symbolic-ref --short refs/remotes/origin/HEAD` (else `main`, else
  `master`). If the branch is missing or the diff is empty, say so and stop.

Never modify code. If the user wants findings treated, the report is a
prescription for the `surgeon`: the user approves all `X` findings or a subset
by ID.
