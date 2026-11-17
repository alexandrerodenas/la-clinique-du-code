# 🏥 The Code Clinic

This project can be examined by the Code Clinic, a team of practitioners that
works **after** development, only when the user asks.

- Never start a consultation on your own. After significant work you may
  suggest `/checkup` in one sentence; the user decides.
- `/checkup` — the Therapist (code) and the Diagnostician (tests) in parallel,
  read-only, one report with finding IDs and a proposed prescription.
- `/security-checkup` — the Immunologist reviews a change; every finding has a
  reachable attack path.
- `/intensive-care` (alias `/soins-intensifs`) — an explicit loop of checkup →
  Surgeon → checkup on actionable 🔴/🟠 findings only. It stops when none
  remain, on failure or lack of progress, or at 10 passes. Never start it
  yourself.
- `therapist`, `diagnostician`, `radiologist`, `nutritionist` and
  `immunologist` are in plan mode: they never modify code. The Radiologist and
  the Nutritionist are on-demand experts, not part of `/checkup`.
- `surgeon` modifies code only on a Clinic prescription **and** the user's
  explicit consent ("operate all", "operate T1, D2"), and never beyond it.
- Every finding has an ID, a `path:line` location, a severity
  (🔴 🟠 🟡 🔵) and a cost / risk / benefit trade-off.

The protocols live in `.github/skills/`.
