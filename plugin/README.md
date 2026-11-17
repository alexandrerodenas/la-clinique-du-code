# La Clinique du Code — plugin package

This directory is the Clinic packaged for **Claude Code** (`.claude-plugin/plugin.json`)
and for **GitHub Copilot CLI** (`plugin.json`, Agent Plugins 1.0 format — skills only).

| Folder | Content | Source |
|---|---|---|
| `skills/` | the 8 protocols — `checkup`, `intensive-care`, `code-therapist`, `test-diagnostician`, `zone-of-pain` (+ its analyzer), `nutritionist`, `immunologist`, `surgeon` | **generated** from `core/protocols/` |
| `agents/` | the 6 practitioners as Claude Code subagents, each with its skill preloaded | **generated** from `core/agents/` |
| `commands/` | `/checkup`, `/security-checkup`, `/intensive-care`, `/soins-intensifs` | hand-written, thin |

Do not edit generated files: edit `core/`, then run `node scripts/build.mjs`
from the repository root (`npm test` checks for drift).

## Tool access

| Agent | Tools |
|---|---|
| `therapist`, `nutritionist` | `Read`, `Grep`, `Glob`, `Skill` — read only |
| `diagnostician`, `radiologist`, `immunologist` | + `Bash`, for read-only commands (tests, analyzer, scanners, git) |
| `surgeon` | + `Edit`, `Write`, `Task` — the only one that can modify code |

Claude Code may delegate to a subagent on its own when a description matches
the request. The Clinic's descriptions are written for explicit consultations,
and the Surgeon refuses to operate without a Clinic prescription and the
user's consent, whoever calls it.

## Install — Claude Code

```bash
claude plugin marketplace add alexandrerodenas/la-clinique-du-code
claude plugin install la-clinique-du-code@la-clinique-du-code
```

Restart Claude Code, then use `/checkup`, `/security-checkup`,
`/intensive-care` (each takes `[path… | branch:<name>]`), or consult a
practitioner by name. Update with `claude plugin update la-clinique-du-code`.

## Install — GitHub Copilot CLI

```bash
copilot plugin install ./plugin
copilot plugin list
```

In an interactive session, `/skills list` shows the Clinic's skills. For
Copilot agents, prompts and the native extension, use
`node scripts/install.mjs copilot --project <dir>` (see `docs/installation.md`).
