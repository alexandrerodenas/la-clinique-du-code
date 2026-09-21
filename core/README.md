# Core portable

The `core/` folder contains the independent elements of an agent harness:

- practitioner protocols in `protocols/`;
- reusable local tools in `tools/`;
- the operating principles of the Clinic.

The `intensive-care` protocol describes the explicit path which links a
checkup, the Surgeon and new checkups until the disappearance of the
actionable prescription. Each adapter translates this protocol into its own
command format, without changing its guardrails.

An adapter is responsible for translating these protocols into the format
expected by a coding assistant. The OpenCode and GitHub Copilot adapters are
located in `adapters/opencode/` and `adapters/copilot/`, respectively.

The protocols do not require any particular command or delegation tool,
nor specific permission. The orchestrator who uses them must guarantee the
constraints of each practitioner, in particular the absence of modification during a
diagnosis.
