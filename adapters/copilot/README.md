# GitHub Copilot adapter

For GitHub Copilot in VS Code and the GitHub Copilot application. Installed
per project:

```bash
node scripts/install.mjs copilot --project /path/to/project   # --dry-run, --uninstall
```

| Installed to (`<project>/.github/`) | From |
|---|---|
| `skills/<name>/SKILL.md` (+ analyzer) | `plugin/skills/` (generated from `core/protocols/`) |
| `agents/<name>.agent.md` — 6 practitioners | `agents/` (generated from `core/agents/` — do not edit) |
| `agents/checkup.agent.md`, `intensive-care.agent.md`, `security-checkup.agent.md` — coordinators | `agents/` (hand-written) |
| `prompts/*.prompt.md` — `/checkup`, `/security-checkup`, `/intensive-care`, `/soins-intensifs` | `prompts/` |
| `extensions/la-clinique-du-code/extension.mjs` | `extensions/` |
| a Clinic block in `copilot-instructions.md` (between markers; your content is kept) | `templates/copilot-instructions.md` |

Every agent is `user-invocable` with `disable-model-invocation: true`: the
model never picks a Clinic agent on its own. Diagnostic agents get `read` and
`search` tools, plus `execute` when their protocol runs read-only commands;
only `surgeon` gets `edit`. No model is forced: agents inherit the session's.

In the Copilot application, the extension registers the same four commands,
the `clinic_checkup`, `clinic_security_checkup` and `clinic_intensive_care`
tools for hosts without native commands, and the practitioners as subagents.
Its `onUserPromptSubmitted` hook is a compatibility bridge for older CLI
versions. `install.ps1` is a PowerShell wrapper around the installer.
