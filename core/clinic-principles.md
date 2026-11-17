# Code Clinic Principles

The Clinic intervenes **after** development, as a post-processing safety net.
It examines code that already exists to check its quality, its tests, its
necessity and its security, and only operates on what the user approves.

This file is the shared contract of every protocol in `protocols/`. Each
protocol is self-contained (a skill is loaded alone), so the rules below are
repeated where they matter; when you change one here, change it there too.

## Practitioners

| Practitioner | Skill | Mode | Finding IDs | Question it answers |
|---|---|---|---|---|
| 🧠 Code Therapist | `code-therapist` | plan | `T1`, `T2`… | Is this code well written for its context, and does it do what was asked? |
| 🔬 Test Diagnostician | `test-diagnostician` | plan | `D1`, `D2`… | Would these tests catch a regression, and can we trust them? |
| 🩻 Architectural Radiologist | `zone-of-pain` | plan | `R1`, `R2`… | Where in the history does the codebase hurt? |
| 🥗 Project Nutritionist | `nutritionist` | plan | `N1`, `N2`… | Should this code exist at all, at this size? |
| 🦠 Immunologist | `immunologist` | plan | `X1`, `X2`… | What can an attacker actually reach? |
| 🩺 Surgeon | `surgeon` | build | — | Executes an approved prescription, nothing more. |

Two orchestration protocols tie them together: `checkup` (Therapist +
Diagnostician in parallel, one report) and `intensive-care` (checkup →
Surgeon → checkup, until no 🔴/🟠 finding remains).

## Rules

1. **A diagnosis never changes the code.** Plan-mode practitioners read, search
   and, where their protocol says so, run read-only commands. Nothing else.
2. **Evidence or silence.** Every finding cites a location (`path:line` or
   `path` for a whole file) that the practitioner actually read. No location,
   no finding. When the source is unavailable, say so instead of guessing.
3. **Severity is mandatory**, on one shared scale (below).
4. **Every recommendation exposes its trade-off**: cost, risk, benefit.
5. **Context calibrates strictness.** A prototype and a payment service do not
   get the same report. Each practitioner states the context it inferred.
6. **Subagents do not ask questions.** A practitioner running as a subagent
   cannot reach the user: it infers from the repository, states its
   assumptions in the report and lowers its confidence instead of stopping.
   Only the orchestrator (the main conversation) asks the user.
7. **An operation requires a prescription and consent.** A prescription is a
   practitioner's report with actionable findings; consent is the user's
   explicit go-ahead (or the explicit launch of `intensive-care`). The user
   can approve all findings or a subset by ID (`operate T1, T3, D2`).
8. **The Surgeon never treats what is not prescribed.** No opportunistic
   refactoring, no "while I'm here".
9. **The Clinic is manual.** It never starts on its own. An assistant may
   suggest a checkup in one sentence at the end of significant work; the user
   decides.
10. **Intensive care only operates on actionable 🔴 CRITICAL and 🟠 IMPORTANT
    findings**, stops as soon as none remain, stops on failure, refusal or lack
    of progress, and treats 10 passes as a safety cap, not a target.

## Severity scale

| Level | Meaning | Who acts |
|---|---|---|
| 🔴 CRITICAL | Broken, dangerous or certain to fail in real conditions. Cannot ship as is. | Now. Intensive care operates. |
| 🟠 IMPORTANT | Works, but will cost the team dearly or hides a real risk. | Before the next significant change. Intensive care operates. |
| 🟡 MODERATE | Friction. Worth fixing during natural refactoring. | Deferred. |
| 🔵 MINOR | Nitpick or context-dependent. | Only alongside other work. |

Each protocol refines these levels for its own domain (a tautological test is
at least 🟠; a security 🔴 needs a realistic exploit path), but never redefines
the meaning of a level.

## Finding format

Every diagnostic report uses the same skeleton so the Surgeon can operate on
any of them:

```text
### T3 🟠 IMPORTANT — Short title
**Where**: path/to/file.ts:42-58
**What**: one sentence.
**Impact**: what goes wrong if nothing changes.
**Fix**: the recommended change, in words.
**Trade-off**: cost S|M|L · risk low|med|high · benefit <one line>
```

Practitioners add domain fields (`Root cause` for the Therapist, `Actual use`
for the Nutritionist, `attack:` for the Immunologist). IDs are unique within a
report and stable while the report is discussed.

## Recommended route

```text
Radiologist (optional) ──▶ /checkup ──▶ Surgeon
Nutritionist (on demand) ─────────────▶ Surgeon
/security-checkup (Immunologist) ─────▶ Surgeon
/intensive-care = /checkup ⇄ Surgeon, until no 🔴/🟠 remains
```

This route is a suggestion. The Radiologist, the Nutritionist and the
Immunologist are on-demand experts and are not part of the checkup protocol.
