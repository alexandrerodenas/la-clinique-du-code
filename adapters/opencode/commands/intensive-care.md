---
description: "Code Clinic intensive care: alternates read-only checkups with Surgeon operations on actionable 🔴 CRITICAL and 🟠 IMPORTANT findings only, and stops when none remain (10-pass safety cap)."
agent: build
---

# 🏥 Code Clinic intensive care

Load the `intensive-care` skill and the `checkup` skill it relies on, with the
skill tool, and apply them in full.

**Scope requested:** `$ARGUMENTS` (empty: the current session's work, else the uncommitted changes). Keep it identical for every pass.

By running this command the user consents to operations on the 🔴/🟠 findings
of each pass, within this scope — nothing more. In OpenCode, checkups dispatch
`therapist` and `diagnostician` in parallel with `task`; operations go to the
`surgeon` subagent, never in parallel with a checkup.

Stop as soon as no actionable 🔴/🟠 finding remains, on any failure, refusal
or lack of progress, or at pass 10. Never claim success that was not verified.
