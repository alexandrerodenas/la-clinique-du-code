# 🧭 Usage

## The `/checkup` command

This command is provided by the OpenCode and GitHub Copilot adapters. In
the GitHub Copilot application, the native extension registers `/checkup` and
also exposes the `clinic_checkup` compatibility tool. It orchestrates
`therapist` and `diagnostician` in the current session; no model is
fixed, so the subagents inherit the model from the parent session. In VS
Code, it is provided by the prompt file `.github/prompts/checkup.prompt.md`.
The checkup protocol remains reusable by other integrations.

In OpenCode it is installed as a command. In VS Code it appears
in the Copilot chat using the prompt file `.github/prompts/checkup.prompt.md`.

One command, two practitioners, one report.

```bash
/checkup                                # consult the current session's work
/checkup <path>                         # consult a specific scope
/checkup branch:<branch>                # consult a branch diff (against the base)
```

`/checkup` opens the patient file, then:

1. **The Code Therapist** examines the source code in scope;
2. **The Test Diagnostician** runs the tests in the laboratory, measures their
   duration, and reports any test exceeding 5 seconds, as well as timeouts and
   hangs;
3. The Clinic produces a **checkup report**: findings by severity, verdict
overall (✅ healthy / ⚠️ necessary care / ❌ hospitalization) and prioritized prescription.

> ⚠️ Golden rule of the clinic: **no operations during a checkup**. The
> practitioners diagnose and prescribe. The operation (refactoring) is performed
> only with the explicit consent of the patient — the user.

## Intensive care mode

The OpenCode and Copilot adapters also offer `/intensive-care`, with
`/soins-intensifs` as French alias. This is the only mode that connects
automatically diagnose and operate, and it remains fully opt-in:
explicitly launching the command constitutes consent for successive prescriptions
within the provided scope.

```bash
/intensive-care                         # current session
/intensive-care <path>                  # specific scope
/intensive-care branch:<branch>         # branch diff against the base
/soins-intensifs <path>               # French alias
```

The protocol launches a checkup, transmits its actionable prescription to the
Surgeon, checks the result, then reruns a checkup with the same scope.
It stops when there is no longer a prescription, in the event of refusal or failure,
no progress, or after 10 passes. Each pass and its reason for stopping
appear in the final balance sheet. A speculative or non-actionable recommendation
does not trigger an operation.

## On-demand consultations

Each practitioner can be consulted individually when you need it:

```bash
analyze this repository's zone of pain    # radiological scan (churn + coupling)
consult the Nutritionist about src/    # verify that this code is necessary
ask the Therapist to review my code    # focused quality review
```

Clinic agents can only be invoked by the user. They are not automatically
selected by the model; `/checkup` launches the checkup coordinator in the
current session.

After significant development, your assistant may **invite** you to initiate a
checkup:

> “The development is complete. Would you like me to run a Code Clinic checkup
> before acceptance testing?”

It's up to you. It's the contract.

## The transition to the block

When a report (checkup, consultation, radiology) contains treatment to be operated on,
entrust the prescription to the **Surgeon**:

```bash
have the Surgeon execute the checkup prescription
```

The Surgeon divides the prescription into batches, dispatches a sub-agent per batch,
checks the diffs and tests, then provides a post-operative report. Never an operation
without a validated prescription — and never an operation beyond the prescription.
