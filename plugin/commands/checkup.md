---
description: "Code Clinic checkup: the Code Therapist and the Test Diagnostician examine the working tree, a path or a branch diff, read-only, and return one clinical report with finding IDs and a prioritized prescription."
argument-hint: "[path… | branch:<name>]"
---

# 🏥 Code Clinic checkup

Load the `checkup` skill and apply it in full.

**Scope requested:** `$ARGUMENTS` (empty: the current session's work, else the uncommitted changes).

In Claude Code, dispatch the `therapist` and `diagnostician` subagents in
parallel — two `Agent` (formerly `Task`) calls in the same message — with
complete briefs: they cannot ask the user anything.

Never modify code during a checkup. End with the proposed prescription and
offer the handoff to the `surgeon`: the user approves all findings or a subset
by ID.
