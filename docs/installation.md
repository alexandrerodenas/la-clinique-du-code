# 📋 Installation — Make an appointment

The Clinic is one portable core (`core/`) and one integration per coding
assistant. Pick yours below. Every installer is a single cross-platform
command (Windows, macOS, Linux) that needs only **Node.js ≥ 18** — the same
Node the Radiologist's analyzer uses.

| Assistant | Recommended install | Where it goes |
|---|---|---|
| Claude Code | the plugin | managed by Claude Code |
| OpenCode | `node scripts/install.mjs opencode` | `~/.config/opencode/` (global) |
| GitHub Copilot — VS Code, Copilot app | `node scripts/install.mjs copilot --project <dir>` | `<dir>/.github/` (per project) |
| GitHub Copilot CLI | `copilot plugin install ./plugin` | skills only |

Every `scripts/install.mjs` target accepts `--dry-run` (show what would
change) and `--uninstall` (remove the Clinic's files and nothing else).
Re-running an install updates the files in place.

## Claude Code

### Plugin (recommended)

```bash
claude plugin marketplace add alexandrerodenas/la-clinique-du-code
claude plugin install la-clinique-du-code@la-clinique-du-code
```

Restart Claude Code. Update later with `claude plugin update la-clinique-du-code`.
The plugin provides the 8 skills, the 6 practitioner subagents and the
`/checkup`, `/security-checkup`, `/intensive-care` and `/soins-intensifs`
commands. See [`plugin/README.md`](../plugin/README.md).

### Manual install

If you prefer plain files in `~/.claude/`:

```bash
git clone https://github.com/alexandrerodenas/la-clinique-du-code.git
cd la-clinique-du-code
node scripts/install.mjs claude          # or: --dest <dir> for another config folder
```

Do not combine the manual install with the plugin: you would get every
practitioner twice.

## OpenCode

```bash
git clone https://github.com/alexandrerodenas/la-clinique-du-code.git
cd la-clinique-du-code
node scripts/install.mjs opencode        # honours $XDG_CONFIG_HOME; or --dest <dir>
```

This installs the skills (`skills/`), the practitioners (`agent/`) and the
commands (`commands/`). Then, optionally, add the content of
[`adapters/opencode/templates/AGENTS.md.clinic`](../adapters/opencode/templates/AGENTS.md.clinic)
to your `AGENTS.md` (global or per project) so the assistant knows it may
**suggest** a checkup — never impose one. Restart OpenCode.

## GitHub Copilot (VS Code and the Copilot application)

```bash
node scripts/install.mjs copilot --project /path/to/your/project
```

This writes, in the target project:

- `.github/skills/` — the 8 protocols;
- `.github/agents/` — the 6 practitioners plus the `checkup`,
  `intensive-care` and `security-checkup` coordinators;
- `.github/prompts/` — `/checkup`, `/security-checkup`, `/intensive-care`,
  `/soins-intensifs`;
- `.github/extensions/la-clinique-du-code/extension.mjs` — native commands
  and tools for the Copilot application;
- a Clinic block in `.github/copilot-instructions.md`, between
  `<!-- la-clinique-du-code:start -->` and `:end -->` markers. Your own
  instructions in that file are kept; `--uninstall` removes only the block.

Commit `.github/` to share the Clinic with your team.

## GitHub Copilot CLI

```bash
copilot plugin install ./plugin
copilot plugin list
```

In a session, `/skills list` shows the Clinic's skills. For agents and
commands, use the adapter above.

## Windows PowerShell wrappers

`install.ps1` (OpenCode) and `adapters/<name>/install.ps1` still exist for
compatibility; they call `scripts/install.mjs` with the same arguments.

---

## 🤖 Installation by a coding agent

Paste this into your coding assistant:

```text
Install "La Clinique du Code" for me.

1. Clone https://github.com/alexandrerodenas/la-clinique-du-code.git into a
   temporary folder <tmp>.
2. Check that `node --version` is 18 or later. If Node is missing, stop and
   tell me.
3. Ask me which assistant I use if you cannot tell, then run from <tmp>:
   - Claude Code:   prefer the plugin — tell me to run
                    `claude plugin marketplace add alexandrerodenas/la-clinique-du-code`
                    then `claude plugin install la-clinique-du-code@la-clinique-du-code`;
                    if I want plain files instead: `node scripts/install.mjs claude`
   - OpenCode:      `node scripts/install.mjs opencode`
   - Copilot:       `node scripts/install.mjs copilot --project <my project>`
4. Show me the installer's output. For OpenCode, offer to add
   adapters/opencode/templates/AGENTS.md.clinic (without its first comment
   line) to my global AGENTS.md, and do it only if I agree.
5. Delete <tmp>.
6. Remind me to restart my assistant.
```
