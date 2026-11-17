---
description: "Code Clinic intensive care: alternates read-only checkups with Surgeon operations on actionable 🔴 CRITICAL and 🟠 IMPORTANT findings only, and stops when none remain (10-pass safety cap)."
argument-hint: "[path… | branch:<name>]"
---

# 🏥 Code Clinic intensive care

Load the `intensive-care` skill and apply it in full. It relies on the
`checkup` protocol for every pass: load that skill too.

**Scope requested:** `$ARGUMENTS` (empty: the current session's work, else the uncommitted changes). Keep it identical for every pass.

By running this command the user consents to operations on the 🔴/🟠 findings
of each pass, within this scope — nothing more. In Claude Code:

- checkups dispatch `therapist` and `diagnostician` in parallel with the
  `Agent` (formerly `Task`) tool;
- operations go to the `surgeon` subagent, with the prescribed findings, their
  IDs and locations, and the note that consent comes from intensive care;
- the surgeon never runs in parallel with a checkup.

Stop as soon as no actionable 🔴/🟠 finding remains, on any failure, refusal
or lack of progress, or at pass 10. Never claim success that was not verified.
