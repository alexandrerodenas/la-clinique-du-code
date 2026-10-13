# La Clinique du Code — plugins

This directory packages the Code Clinic's portable protocols (see `../core/`)
for Claude Code and GitHub Copilot CLI. The `skills/` files are exact copies of
`core/protocols/`, including their skill metadata. Regenerate them after
protocol changes with:

```bash
node scripts/sync-plugin-protocols.mjs
```

Check for drift with `node scripts/sync-plugin-protocols.mjs --check`. The
zone-of-pain analyzer is synchronized from `core/tools/` as well.

The package bundles:

- `skills/` — the six portable protocols (`code-therapist`,
  `intensive-care`, `nutritionist`, `surgeon`, `test-diagnostician`,
  `zone-of-pain`), synchronized from `core/protocols/`. The `zone-of-pain`
  skill also carries its analyzer script.
- `agents/` — the five practitioners as Claude Code subagents
  (`therapist`, `diagnostician`, `radiologist`, `nutritionist`,
  `surgeon`). Diagnostic practitioners are read-only; `surgeon` is the
  only one with `Edit`/`Write`/`Bash`/`Task`.
- `commands/` — `/checkup`, `/intensive-care` and a short alias command
  `/soins-intensifs` that delegates to the same protocol.

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

`adapters/claude/` provides an optional manual/global install (copying files
straight into `~/.claude/`) for anyone who does not want to use the plugin
system. It reuses this package's Claude agents and commands rather than
maintaining divergent copies. The plugin can be kept up to date with
`claude plugin update la-clinique-du-code`. `adapters/copilot/` contains the
separate GitHub Copilot application and VS Code integration.
