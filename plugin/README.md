# La Clinique du Code — plugins

This directory packages the Code Clinic's portable protocols (see `../core/`)
for Claude Code and GitHub Copilot CLI. It bundles:

- `skills/` — the six portable protocols (`code-therapist`,
  `intensive-care`, `nutritionist`, `surgeon`, `test-diagnostician`,
  `zone-of-pain`), copied verbatim from `core/protocols/`. The
  `zone-of-pain` skill also carries its analyzer script.
- `agents/` — the five practitioners as Claude Code subagents
  (`therapist`, `diagnostician`, `radiologist`, `nutritionist`,
  `surgeon`). Diagnostic practitioners are read-only; `surgeon` is the
  only one with `Edit`/`Write`/`Bash`/`Task`.
- `commands/` — `/checkup`, `/intensive-care` and its alias
  `/soins-intensifs`.

The `plugin.json` manifest packages the portable skills for Copilot CLI using
the Agent Plugins 1.0 format. The Copilot application and VS Code integration
remain in `adapters/copilot/`.

## Install — Claude Code

```
claude plugin marketplace add alexandrerodenas/la-clinique-du-code
claude plugin install la-clinique-du-code@la-clinique-du-code
```

Restart Claude Code. Then use `/checkup [path|branch:<name>]` or
`/intensive-care [path|branch:<name>]`, or consult a practitioner directly
by name (e.g. "consult the radiologist on this repo's zone of pain").

## Install — GitHub Copilot CLI

From the repository root, install this directory as a plugin:

```
copilot plugin install ./plugin
```

Check that it is installed with `copilot plugin list`. In an interactive
session, use `/skills list` to see the Clinic's portable skills.

## Relationship to the other adapters

`adapters/claude/` documents the older manual/global install (copying
files straight into `~/.claude/`) for anyone who does not want to use the
plugin system. This `plugin/` directory is the same protocols packaged so
they can be managed with `claude plugin` and kept up to date with
`claude plugin update la-clinique-du-code`. `adapters/copilot/` contains the
separate GitHub Copilot application and VS Code integration.
