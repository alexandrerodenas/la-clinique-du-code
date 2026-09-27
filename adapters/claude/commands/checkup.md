---
description: Complete checkup of the Code Clinic. The Code Therapist examines the code, the Test Diagnostician examines the tests. Scope: working tree, path, or branch (diffs). Produces a clinical report with verdict.
argument-hint: [path|branch:<name>]
---

# 🏥 Code Clinic Checkup

You open the Code Clinic. Two practitioners will examine the user's patient file: their recently developed or existing code.

**Scope of consultation:** $ARGUMENTS
(if empty: covers the code and tests developed in the current session, or ask the user to specify the scope)

## Checkup protocol

1. **Preparation of the patient file** — Clearly identify the scope:
   - **Working tree / path**: `/checkup` or `/checkup src/services` → the working tree files (new or modified)
   - **Branch**: `/checkup branch:<name>` → files modified by the branch compared to the base branch
   - The associated test files
   - The type of project and its context (calibration necessary for practitioners)

For **branch mode**:
   - Determine the base: the default branch of the remote (`git remote show origin`, or `origin/HEAD`)
   - List the affected files: `git diff --name-only <base>...<branch>`
   - Get diffs: `git diff <base>...<branch>`
   - Practitioners analyze these diffs (local context can complete the reading if a file lacks context)

**Branch mode**: the branch must be present locally (fetch beforehand if necessary). If the branch does not exist or if the diff is empty, warn the user and stop the consultation.

2. **Code Therapist Consultation** — Launch the `therapist` subagent (`Task` tool, `subagent_type: therapist`) with the patient file (scope + project context) as input. It loads the `code-therapist` skill itself and applies the complete protocol: understand the context, detect problems, assess severity, diagnose root causes, recommend with trade-offs.

3. **Test Diagnostician Analysis** — Launch the `diagnostician` subagent (`Task` tool, `subagent_type: diagnostician`) with test files in scope as input. It loads the `test-diagnostician` skill itself and reviews the tests with its complete checklist (readability, structure, isolation, relevance of assertions, etc.).

The two consultations can be launched **in parallel** (two `Task` calls in the same message). Retrieve their reports before summarizing.

4. **Checkup report** — Summarize the two consultations in a single report, structured like a medical file:

```
## 🏥 Checkup Report — The Code Clinic

### Patient file
- Perimeter: ...
- Project context: ...
- Date: ...

### Observation of the Code Therapist (code-therapist)
(Summary of the consultation: strengths, findings by severity 🔴🟠🟡🔵, main root cause)

### Analysis of the Test Diagnostician (test-diagnostician)
(Summary: laboratory verdict, findings, quality of coverage and robustness)

### Overall verdict
- ✅ Clean code — nothing blocking
- ⚠️ Necessary care — issues to be addressed before the next iteration
- ❌ Hospitalization — critical issues to be addressed immediately

### Order (next steps)
Prioritized by severity, with trade-offs (cost/risk/benefit).
```

## Clinic Rules

- **Never** modify code during a checkup: you are performing diagnostics. Offer care, but do not operate without the patient's consent.
- Each finding must have a level of severity (🔴 CRITICAL / 🟠 IMPORTANT / 🟡 MODERATE / 🔵 MINOR).
- Recommendations must be contextualized to the project (POC vs critical service, etc.).
- A checkup is an invitation to act, not an obligation: it is the user who decides on further treatment.

## Surgical handoff

If the user wants the treatment operated on, the checkup report acts as a **prescription**: suggest entrusting it to the Surgeon (`surgeon`) — the agent in build mode that will execute the prescription in sub-agents, batch by batch, with verification. Never operate without this validated prescription.
