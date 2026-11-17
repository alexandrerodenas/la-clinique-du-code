# Core — the portable Clinic

Everything here is independent of any coding assistant. The adapters only
translate it.

```text
core/
├── clinic-principles.md   the shared contract: rules, severity scale, finding format
├── protocols/             one skill per file — the source of truth
│   ├── checkup.md             orchestration: Therapist + Diagnostician, one report
│   ├── intensive-care.md      orchestration: checkup ⇄ Surgeon on 🔴/🟠 only
│   ├── code-therapist.md      🧠 code quality, architecture, spec compliance
│   ├── test-diagnostician.md  🔬 tests
│   ├── zone-of-pain.md        🩻 git history x-ray
│   ├── nutritionist.md        🥗 necessity
│   ├── immunologist.md        🦠 security
│   └── surgeon.md             🩺 operating on a prescription
├── agents/                one practitioner per file: persona + access level (read | run | build)
└── tools/
    └── zone-of-pain-analyzer.js   the Radiologist's read-only analyzer (Node ≥ 14, no dependency)
```

## Editing the Clinic

1. Edit `core/` only. Protocols carry their own skill front matter (`name`,
   `description`); agents carry `name`, `skill`, `access` and `description`.
2. Regenerate the derived files and run the tests:

   ```bash
   node scripts/build.mjs   # plugin/skills, plugin/agents, adapters/*/agents
   npm test                 # build --check + structure, installer and analyzer tests
   ```

`scripts/build.mjs` copies protocols verbatim into `plugin/skills/` and renders
each agent in the native format of Claude Code, OpenCode and GitHub Copilot
(tools and permissions derived from its access level). Generated files carry
a header saying so; CI fails if they drift from `core/`.

Commands (`/checkup`, `/intensive-care`, `/soins-intensifs`,
`/security-checkup`) are thin, hand-written per adapter: each one loads a
protocol and adds only the harness-specific delegation details.

## Guarantees the orchestrator must keep

The protocols need no particular tool or permission system, but whoever runs
them must keep their constraints: no modification during a diagnosis, the
Surgeon only on a prescription plus consent, intensive care only on 🔴/🟠
findings with its stop conditions.
