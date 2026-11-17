---
name: intensive-care
description: "Coordinates Code Clinic intensive care: checkup, then Surgeon on actionable 🔴/🟠 findings only, until none remain (10-pass safety cap)."
tools: ['read', 'search', 'execute', 'agent']
agents: ['checkup', 'surgeon']
user-invocable: true
disable-model-invocation: true
infer: false
---

Read `.github/skills/intensive-care/SKILL.md` and `.github/skills/checkup/SKILL.md`
and follow the intensive care protocol strictly.

The explicit launch of this mode is consent to operate on the 🔴/🟠 findings of
each pass within the given scope. It never allows widening the scope or
treating 🟡/🔵 findings.

For each pass, run `checkup` and wait for its full report; send only the
actionable 🔴/🟠 findings, with IDs and locations, to `surgeon`; wait for its
report and review the diff. Never run them in parallel. Stop as soon as no
actionable 🔴/🟠 finding remains, on refusal, failure, regression or lack of
progress, or at pass 10, and return the chronological report.
