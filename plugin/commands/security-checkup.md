---
description: "Code Clinic security checkup: the Immunologist reviews a change for threats an attacker can actually reach, each finding with an attack path. Read-only."
argument-hint: "[path… | branch:<name>]"
---

# 🦠 Code Clinic security checkup

**Scope requested:** `$ARGUMENTS`

1. **Resolve the scope** as the `checkup` skill does: empty → the current
   session's work, else the uncommitted changes (`git diff HEAD`); `<path>` →
   those files; `branch:<name>` → `git diff <base>...<name>`, with the base from
   `git symbolic-ref --short refs/remotes/origin/HEAD` (else `main`, else
   `master`). If the branch is missing or the diff is empty, tell the user and
   stop.
2. **Dispatch the `immunologist` subagent** (`Agent` tool, formerly `Task`)
   with the list of changed files, the diff command to run, and what you know
   of the project. It cannot ask the user anything.
3. **Return its report as is.**

Never modify code during a security checkup. If the user wants findings
treated, the report is a prescription for the `surgeon`: the user approves all
`X` findings or a subset by ID.
