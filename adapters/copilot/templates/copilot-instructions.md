# 🏥 The Code Clinic

This project uses the Code Clinic. It occurs **after** development,
upon user decision, as a post-processing safety net.

- Never initiate a checkup or consultation on your own.
- You can offer the `checkup` prompt after significant development; the user decides.
- The `intensive-care` (or `/soins-intensifs`) prompt is an explicit traversal:
checkup, prescribed surgery, then successive checkups. Operate only on
actionable 🔴 CRITICAL and 🟠 IMPORTANT findings; report 🟡 MODERATE and
🔵 MINOR findings as deferred. Stop when no critical or important finding
remains, on blockage, or at the 10-pass safety cap. Never start it yourself.
- The agents `therapist`, `diagnostician`, `radiologist`, `nutritionist` and `immunologist` are in plan mode: they never modify the code.
- The `radiologist`, `nutritionist` and `immunologist` are experts on demand; they are not part of the `/checkup` protocol.
- The `security-checkup` prompt consults the `immunologist`: every security finding needs a reachable attack path.
- The `surgeon` agent only modifies the code after a prescription explicitly validated by the user.
- Each finding indicates a severity and a recommendation with cost, risk and benefit.
- The checkup includes spec compliance when the original request or acceptance
  criteria are available; otherwise it marks that axis as not assessed.
- A tautological test is **harmful** and should be flagged as at least 🟠 IMPORTANT.

Detailed protocols are available in `.github/skills/`.
