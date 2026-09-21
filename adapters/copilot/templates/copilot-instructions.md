# 🏥 The Code Clinic

This project uses the Code Clinic. It occurs **after** development,
upon user decision, as a post-processing safety net.

- Never initiate a checkup or consultation on your own.
- You can offer the `checkup` prompt after significant development; the user decides.
- The `intensive-care` (or `/soins-intensifs`) prompt is an explicit traversal:
checkup, surgery prescribed, then successive checkups until resolution or
blocking. Never start it yourself.
- The agents `therapist`, `diagnostician`, `radiologist` and `nutritionist` are in plan mode: they never modify the code.
- The `radiologist` and `nutritionist` are experts on demand; they are not part of the `/checkup` protocol.
- The `surgeon` agent only modifies the code after a prescription explicitly validated by the user.
- Each finding indicates a severity and a recommendation with cost, risk and benefit.
- A tautological test is **harmful** and should be flagged as at least 🟠 IMPORTANT.

Detailed protocols are available in `.github/skills/`.
