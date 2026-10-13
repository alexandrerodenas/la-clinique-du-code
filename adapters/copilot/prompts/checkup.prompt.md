---
description: Launches a manual checkup of the Code Clinic on the requested perimeter.
agent: checkup
---

# 🏥 Code Clinic Checkup

You coordinate a checkup, without modifying the code.

## Perimeter

Analysis `${input:scope:path, branch, or scope to examine}`.
For a branch, analyzes the diffs compared to the base branch and includes the
associated tests.

## Consultation

Use the original user request, specification or acceptance criteria as the
functional contract when available. Pass that evidence to the Therapist. If no
usable contract is available, say spec compliance was not assessed; do not
invent requirements.

1. Read `.github/skills/code-therapist/SKILL.md` and analyze code quality and spec compliance with the `therapist` agent.
2. Read `.github/skills/test-diagnostician/SKILL.md` and analyze the tests with agent `diagnostician`.
3. If necessary, also consult `radiologist` or `nutritionist`, but do not launch
of operation.
4. Summarize spec compliance, findings sorted by severity, the
overall verdict and a cost/risk/benefit order.

Any tautological test must be marked **harmful**, with minimum severity
🟠 IMPORTANT.
