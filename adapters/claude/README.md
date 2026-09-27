# Claude Code Adapter

This adapter translates the portable protocols of `core/` into
conventions used by [Claude Code](https://claude.com/claude-code):

- `~/.claude/skills/<name>/SKILL.md` for practitioner protocols (copied
  verbatim from `core/protocols/`, since their front matter already matches
  Claude Code's skill format);
- `~/.claude/agents/*.md` for the practitioners, as Claude Code subagents —
  each diagnostic practitioner (`therapist`, `diagnostician`, `radiologist`,
  `nutritionist`) is restricted to read-only tools (`Read`, `Grep`, `Glob`,
  and `Bash` only where the protocol requires running something read-only);
  `surgeon` is the only subagent with `Edit`, `Write`, `Bash` and `Task`;
- `~/.claude/commands/checkup.md` for the manual `/checkup` command;
- `~/.claude/commands/intensive-care.md` (and its alias
  `soins-intensifs.md`) for the `/intensive-care` loop;
- `templates/CLAUDE.md.clinic` — the block to add to your `CLAUDE.md`
  (global or per-project) so your assistant knows about the Clinic and can
  suggest, but never impose, a checkup.

The zone-of-pain analyzer is copied to
`~/.claude/skills/zone-of-pain/zone-of-pain-analyzer.js`.

## Installation

From the root of the Clinic:

```powershell
.\adapters\claude\install.ps1
```

The script installs the protocols as skills, the subagents, and the
`/checkup` / `/intensive-care` commands in your global Claude Code
configuration (`~/.claude/`) — they will be available in every project.
It then prints the `CLAUDE.md` block to add by hand; it never edits an
existing `CLAUDE.md` for you.

## Usage

Once installed, restart Claude Code. Then:

- `/checkup [path|branch:<name>]` — dispatches `therapist` and
  `diagnostician` in parallel (via the `Task` tool) and produces a clinical
  report with a prioritized prescription.
- `/intensive-care [path|branch:<name>]` (alias `/soins-intensifs`) —
  loops checkup → surgeon → checkup until the prescription is exhausted,
  a blockage occurs, or 10 passes are reached.
- Each practitioner can also be summoned directly, by name, for an on-demand
  consultation (e.g. "consult the radiologist on this repo's zone of pain").

Every subagent is user-invocable only: none of them is auto-selected by the
model, and `surgeon` refuses to operate without a validated prescription and
explicit consent, exactly as the portable `surgeon` protocol requires.
