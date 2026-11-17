# Claude Code adapter

The recommended install is the plugin in [`../../plugin/`](../../plugin/):

```bash
claude plugin marketplace add alexandrerodenas/la-clinique-du-code
claude plugin install la-clinique-du-code@la-clinique-du-code
```

This folder only exists for a **manual** install into `~/.claude/`, reusing
exactly the plugin's files:

```bash
node scripts/install.mjs claude            # --dest <dir>, --dry-run, --uninstall
```

| Installed to | From |
|---|---|
| `~/.claude/skills/<name>/SKILL.md` (+ the zone-of-pain analyzer) | `plugin/skills/` |
| `~/.claude/agents/<name>.md` | `plugin/agents/` |
| `~/.claude/commands/<name>.md` | `plugin/commands/` |

`install.ps1` is a PowerShell wrapper around the same command. Do not combine
the manual install with the plugin. No `CLAUDE.md` block is required.
