---
description: "Security checkup of the Code Clinic. The Immunologist examines a change for reachable threats, each finding with an attack path. Scope: working tree, path, or branch (diffs)."
argument-hint: [path|branch:<name>]
---

# 🦠 Code Clinic Security Checkup

You open the Clinic's immunology department. The Immunologist will examine the user's change for threats an attacker could actually reach.

**Scope of consultation:** $ARGUMENTS
(if empty: covers the code developed in the current session, or ask the user to specify the scope)

## Protocol

1. **Preparation of the patient file** — Clearly identify the scope:
   - **Working tree / path**: `/security-checkup` or `/security-checkup src/api` → the working tree files (new or modified)
   - **Branch**: `/security-checkup branch:<name>` → `git diff <base>...<branch>`, with the base being the remote's default branch. The branch must be present locally; if it does not exist or the diff is empty, warn the user and stop.

2. **Immunologist consultation** — Launch the `immunologist` subagent (`Task` tool, `subagent_type: immunologist`) with the scope as input. It loads the `immunologist` skill itself and applies its complete protocol.

3. **Report** — Return the Immunologist's report as is.

## Clinic Rules

- **Never** modify code during a security checkup: you are performing diagnostics.
- A security checkup is an invitation to act, not an obligation: the user decides on further treatment.

## Surgical handoff

If the user wants the findings treated, the report acts as a **prescription**: suggest entrusting it to the Surgeon (`surgeon`). Never operate without this validated prescription.
