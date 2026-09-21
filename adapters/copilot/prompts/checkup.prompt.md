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

1. Read `.github/skills/code-therapist/SKILL.md` and analyze the code with the `therapist` agent.
2. Read `.github/skills/test-diagnostician/SKILL.md` and analyze the tests with agent `diagnostician`.
3. If necessary, also consult `radiologist` or `nutritionist`, but do not launch
of operation.
4. Summarizes a relationship with the context, the findings sorted by severity, the
overall verdict and a cost/risk/benefit order.

Any tautological test must be marked **harmful**, with minimum severity
🟠 IMPORTANT.
