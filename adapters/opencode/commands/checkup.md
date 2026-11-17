---
description: "Code Clinic checkup: the Code Therapist and the Test Diagnostician examine the working tree, a path or a branch diff, read-only, and return one clinical report with finding IDs and a prioritized prescription."
agent: build
---

# 🏥 Code Clinic checkup

Load the `checkup` skill with the skill tool and apply it in full.

**Scope requested:** `$ARGUMENTS` (empty: the current session's work, else the uncommitted changes).

In OpenCode, dispatch the `therapist` and `diagnostician` subagents in
parallel — two `task` calls in the same message — with complete briefs: they
cannot ask the user anything.

Never modify code during a checkup, even though this command runs under the
build agent. End with the proposed prescription and offer the handoff to the
`surgeon`: the user approves all findings or a subset by ID.
