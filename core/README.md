# Core portable

The `core/` folder contains the independent elements of an agent harness:

- practitioner protocols in `protocols/`;
- reusable local tools in `tools/`;
- the operating principles of the Clinic.

The `intensive-care` protocol links a checkup and the Surgeon until no
actionable 🔴 CRITICAL or 🟠 IMPORTANT finding remains. Lower-severity findings
are reported but do not trigger surgery. Each adapter translates this protocol
into its own command format without changing its guardrails.

`core/protocols/` is the source of truth for the portable skills. Its files
already include the skill metadata used by the adapters, so `plugin/skills/`
can be copied exactly with `node scripts/sync-plugin-protocols.mjs`; use
`--check` to detect drift.

An adapter is responsible for translating these protocols into the format
expected by a coding assistant. The OpenCode, GitHub Copilot and Claude Code
adapters are located in `adapters/opencode/`, `adapters/copilot/` and
`adapters/claude/`, respectively.

The protocols do not require any particular command or delegation tool,
nor specific permission. The orchestrator who uses them must guarantee the
constraints of each practitioner, in particular the absence of modification during a
diagnosis.
