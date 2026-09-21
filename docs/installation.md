# 📋 Installation — Make an appointment

## Architecture

The portable core is located in `core/`. It contains the practitioners'
protocols and the zone-of-pain analyzer. Adapter-specific files are grouped in
`adapters/`.

This page documents the installation of both adapters. Another assistant
can reuse `core/` by providing its own integration.

## Prerequisites

- [OpenCode](https://opencode.ai) or [GitHub Copilot in VS Code](https://code.visualstudio.com/docs/copilot/overview), depending on the chosen adapter

## Step 1 — Clone the clinic

```bash
git clone https://github.com/alexandrerodenas/la-clinique-du-code.git
```

## Step 2 — Install the OpenCode adapter

**Windows (PowerShell):**

```powershell
.\install.ps1
```

The installation copies the `core/` protocols in OpenCode skill format, along
with the agents and the `/checkup` and `/intensive-care` commands (aka
`/soins-intensifs`) and the associated scan tool in the global configuration
of OpenCode — they will be
available in all your projects.

## Step 3 — Install the clinic prompt system

Add the contents of [`adapters/opencode/templates/AGENTS.md.clinic`](../adapters/opencode/templates/AGENTS.md.clinic)
in your `AGENTS.md` (global or per project). This is what gives your assistant the
concept of a checkup: being able to **suggest** a consultation after development —
never impose it.

## Step 4 — Restart OpenCode

The configuration is loaded at startup. Exit and restart OpenCode.

## GitHub Copilot application and GitHub Copilot in VS Code

From the root of the Clinic, install the adapter in the target project:

```powershell
.\adapters\copilot\install.ps1 -ProjectRoot C:\path\to\project
```

The adapter installs the protocols in `.github/skills/`, the native extension
in `.github/extensions/la-clinique-du-code/extension.mjs`, the agents in
`.github/agents/`, the prompts `/checkup` and `/intensive-care` (with the alias
`/soins-intensifs`) in `.github/prompts/` and the global instructions in
`.github/copilot-instructions.md`.

In the GitHub Copilot application, the extension registers native commands
`/checkup`, `/intensive-care` and `/soins-intensifs`, as well as the tools for
`clinic_checkup` and `clinic_intensive_care` compatibility. The checkup
coordinator launches only the `therapist` and `diagnostician` subagents in the
current session; the `radiologist` and `nutritionist` remain available for
consultation on request. The `surgeon` is declared as an explicit subagent,
without a forced model
and without automatic inference: it can only intervene on prescription and
explicit consent. The Diagnostician can run unit tests without
modifying the repository and reports tests exceeding 5 seconds, timeouts and
hangs. In VS Code, the prompt
`.github/prompts/checkup.prompt.md` provides the `/checkup` command and
`.github/prompts/intensive-care.prompt.md` provides intensive care mode. The
diagnostic agents remain read-only.

---

## 🤖 Installation by a code agent (from scratch)

Don't want to do it by hand? Copy and paste the following prompt into your
coding assistant. It will set up the clinic step by step:

```text
You are going to install “La Clinique du Code” (a portable kit with adapters
OpenCode and GitHub Copilot: practitioners [skills] + agents [plan mode +
surgeon] + the /checkup and /intensive-care commands + a system
prompt) from the repository
https://github.com/alexandrerodenas/la-clinique-du-code.git

Follow these steps exactly, in order:

1. Clone the repository into a temporary folder:
git clone https://github.com/alexandrerodenas/la-clinique-du-code.git <tmp>

2. Determine the global OpenCode configuration folder:
   - Windows: %USERPROFILE%\.config\opencode\
   - Linux / macOS: ~/.config/opencode/
(let's call it <config>)

3. Install all protocols as skills:
   - for each file <tmp>\core\protocols\<name>.md, create
     <config>\skills\<name>\SKILL.md (code-therapist, test-diagnostician,
zone-of-pain, nutritionist, and anyone else who appears in the future)
   - copy <tmp>\core\tools\zone-of-pain-analyzer.js to
     <config>\skills\zone-of-pain\zone-of-pain-analyzer.js

4. Install the agents:
   - create the <config>\agent (or agents) folder
   - copy each file <tmp>\adapters\opencode\agents\<name>.md to <config>\agent\<name>.md
     (therapist, diagnostician, radiologist, nutritionist, surgeon,
and all those who appear in the future)

5. Install the commands:
   - copy <tmp>\adapters\opencode\commands\checkup.md to <config>\commands\checkup.md
   - copy <tmp>\adapters\opencode\commands\intensive-care.md to
<config>\commands\intensive-care.md and <config>\commands\soins-intensifs.md

6. Install the clinic prompt system:
   - read the file <tmp>\adapters\opencode\templates\AGENTS.md.clinic
   - append its content to the end of <config>\AGENTS.md
     (removing the first header line “# This block is to be added in the
     AGENTS.md file of your project.”)
   - if <config>\AGENTS.md does not exist, create it with this content

7. Clean the temporary folder <tmp>.

8. Verify that all practitioners, agents, and commands are in place, and
that the clinical block is present in AGENTS.md. Announce the result.

9. Warn the user that they must exit and restart OpenCode for the
   Clinic to take effect.

If you detect former practitioners installed elsewhere (for example
~/.agents/skills/code-therapy, ~/.agents/skills/test-diagnostics or
~/.agents/skills/zone-of-pain), ask the user whether they want to delete them
before finishing.
```

This prompt works with any coding assistant that has a shell
(Windows, Linux or macOS): it does not require a script or specific tool.
