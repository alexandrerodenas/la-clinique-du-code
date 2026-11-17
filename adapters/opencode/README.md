# OpenCode adapter

```bash
node scripts/install.mjs opencode          # --dest <dir>, --dry-run, --uninstall
```

| Installed to (`~/.config/opencode/` or `$XDG_CONFIG_HOME/opencode/`) | From |
|---|---|
| `skills/<name>/SKILL.md` (+ the zone-of-pain analyzer) | `plugin/skills/` (generated from `core/protocols/`) |
| `agent/<name>.md` | `agents/` (generated from `core/agents/` — do not edit) |
| `commands/<name>.md` | `commands/` (hand-written) |

Diagnostic agents get `edit: deny`; `bash` is allowed only for those whose
protocol runs read-only commands (Diagnostician, Radiologist, Immunologist).
The Surgeon is the only agent with `edit: allow`.

Optionally add [`templates/AGENTS.md.clinic`](templates/AGENTS.md.clinic) to
your `AGENTS.md` so the assistant knows it may suggest a checkup.
`install.ps1` is a PowerShell wrapper around the same command.
