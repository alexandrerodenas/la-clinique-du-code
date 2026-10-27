# Claude Code Adapter

> **Prefer a managed install?** See [`../../plugin/`](../../plugin/) — the
> same protocols packaged as a Claude Code plugin, installable with
> `claude plugin marketplace add alexandrerodenas/la-clinique-du-code`. This
> manual adapter remains for anyone who wants the files copied straight
> into their global `~/.claude/` config instead.

This adapter installs the portable protocols of `core/` into
[Claude Code](https://claude.com/claude-code). It reuses the plugin's
Claude-compatible agents and commands, so the managed plugin and manual
installation share one definition:

- `~/.claude/skills/<name>/SKILL.md` for practitioner protocols (copied
  verbatim from `core/protocols/`, since their front matter already matches
  Claude Code's skill format);
- `~/.claude/agents/*.md` for the practitioners, copied from `plugin/agents/` —
  each diagnostic practitioner (`therapist`, `diagnostician`, `radiologist`,
  `nutritionist`, `immunologist`) is restricted to read-only tools (`Read`, `Grep`, `Glob`,
  and `Bash` only where the protocol requires running something read-only);
  `surgeon` is the only subagent with `Edit`, `Write`, `Bash` and `Task`;
- `~/.claude/commands/*.md` for `/checkup`, `/intensive-care`, the short
  `/soins-intensifs` alias and `/security-checkup`, copied from `plugin/commands/`.

The zone-of-pain analyzer is copied to
`~/.claude/skills/zone-of-pain/zone-of-pain-analyzer.js`.

## Installation

From the root of the Clinic:

```powershell
.\adapters\claude\install.ps1
```

The script installs the protocols as skills, the shared subagents and the
commands in your global Claude Code configuration (`~/.claude/`) — they will
be available in every project. No `CLAUDE.md` block is required.

## Usage

Once installed, restart Claude Code. Then:

- `/checkup [path|branch:<name>]` — dispatches `therapist` and
  `diagnostician` in parallel (via the `Task` tool) and produces a clinical
  report with a prioritized prescription.
- `/intensive-care [path|branch:<name>]` (alias `/soins-intensifs`) —
  operates only on actionable 🔴 CRITICAL and 🟠 IMPORTANT findings, stops
  when none remain, and uses 10 passes only as a safety cap.
- Each practitioner can also be summoned directly, by name, for an on-demand
  consultation (e.g. "consult the radiologist on this repo's zone of pain").

Every subagent is user-invocable only: none of them is auto-selected by the
model, and `surgeon` refuses to operate without a validated prescription and
explicit consent, exactly as the portable `surgeon` protocol requires.
