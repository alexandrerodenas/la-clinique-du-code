import { joinSession } from "@github/copilot-sdk/extension";

const checkupInstructions = (scope) => `Tu coordonnes un checkup de La Clinique du Code en mode diagnostic, sans modifier le code.

Perimetre a examiner : ${scope || "le travail de la session courante"}.

Lis les protocoles necessaires dans .github/skills/ puis examine le perimetre avec les consultations suivantes :
1. Le Therapeute du Code : .github/skills/code-therapist/SKILL.md
2. Le Diagnosticien des Tests : .github/skills/test-diagnostician/SKILL.md
3. Si le contexte le justifie, le Radiologue : .github/skills/zone-of-pain/SKILL.md
4. Si la necessite du code est incertaine, le Nutritionniste : .github/skills/nutritionist/SKILL.md

Rends un rapport avec le contexte, les constats tries par severite, les fichiers et lignes concernes, le verdict global et une ordonnance priorisee avec cout, risque et benefice. Un test tautologique est harmful et doit etre signale au minimum comme IMPORTANT.

Ne modifie jamais le code, les tests ou la configuration pendant ce checkup.`;

const session = await joinSession({
    tools: [
        {
            name: "clinic_checkup",
            description:
                "Lance le checkup diagnostique de La Clinique du Code sans modifier le depot.",
            parameters: {
                type: "object",
                properties: {
                    scope: {
                        type: "string",
                        description:
                            "Chemin, branche ou perimetre a examiner. Laisse vide pour la session courante.",
                    },
                },
                additionalProperties: false,
            },
            handler: async (args) => ({
                textResultForLlm: checkupInstructions(args?.scope),
                resultType: "success",
            }),
        },
    ],
    hooks: {
        onUserPromptSubmitted: async (input) => {
            const match = input.prompt.match(/^\/checkup(?:\s+([\s\S]*))?$/i);
            if (!match) {
                return;
            }

            return {
                modifiedPrompt: checkupInstructions(match[1]?.trim()),
            };
        },
        onSessionStart: async () => {
            await session.log("La Clinique du Code est disponible via l'outil clinic_checkup ou /checkup.");
        },
    },
});
