# Adapter GitHub Copilot

This adapter translates the portable protocols of `core/` into conventions
by GitHub Copilot. It supports GitHub Copilot app and GitHub
Copilot in VS Code:

- `.github/skills/` for practitioner protocols;
- `.github/extensions/la-clinique-du-code/extension.mjs` for native plugin
from the GitHub Copilot application;
- `.github/agents/` for specialist practitioners;
- `.github/prompts/checkup.prompt.md` for manual checkup;
- `.github/prompts/intensive-care.prompt.md` for intensive care
(`/intensive-care`, aka `/soins-intensifs`);
- `.github/agents/checkup.agent.md` to coordinate consultations;
- `.github/agents/intensive-care.agent.md` to coordinate the loop
check-up / surgery;
- `.github/copilot-instructions.md` for the reminder of the philosophy of the
Clinical.

The zone-of-pain analyzer is copied to
`.github/skills/zone-of-pain/zone-of-pain-analyzer.js`.

## Facility

From the root of the Clinic:

```powershell
.\adapters\copilot\install.ps1 -ProjectRoot C:\path\to\project
```

The script only creates or updates the Clinic files in the
target project. It does not launch a consultation automatically.

In the GitHub Copilot application, the extension registers native commands
`/checkup`, `/intensive-care` and `/soins-intensifs` and also exposes the tools
`clinic_checkup` and `clinic_intensive_care` for hosts that do not present
native commands. The coordinator launches the diagnosis in the current session; intensive care follows checkup, prescription to the surgeon and
new checkup until resolution, blocking or 10 passes. The Diagnostician can
run unit tests for reading
alone and reports any test exceeding 5 seconds, as well as timeouts and
hangs. This measure completes its critical opinion on the relevance, robustness,
test isolation and maintainability; it does not replace it. All agents
of the Clinic are user-summonable and disabled for automatic summoning
by the model; `surgeon` is only available upon explicit invocation,
with prescription and consent. No `model` field is sent: each
subagent inherits the model from the parent session.

The `onUserPromptSubmitted` hook remains a compatibility bridge for versions
of the CLI which do not yet present the native commands. In VS Code with
GitHub Copilot, the prompt appears as the command `/checkup` and the agents
appear in the agent selector.
