import { joinSession } from "@github/copilot-sdk/extension";

const checkupInstructions = (scope) => `Tu coordonnes un checkup de La Clinique du Code en mode diagnostic, sans modifier le code.

Perimetre a examiner : ${scope || "le travail de la session courante"}.

Lis les protocoles necessaires dans .github/skills/ puis delegue en parallele :
1. le Therapeute du Code (agent therapist) pour le code et l'architecture ;
2. le Diagnosticien des Tests (agent diagnostician) pour les tests.
Les deux agents sont strictement en lecture seule. Si le contexte le justifie,
consulte ensuite radiologist ou nutritionist, eux aussi sans modification.

Rends un rapport avec le contexte, les constats tries par severite, les fichiers et lignes concernes, le verdict global et une ordonnance priorisee avec cout, risque et benefice. Un test tautologique est harmful et doit etre signale au minimum comme IMPORTANT.

Ne modifie jamais le code, les tests ou la configuration pendant ce checkup.
Ne demande pas au surgeon d'intervenir pendant le checkup.`;

const customAgents = [
    {
        name: "therapist",
        displayName: "Therapeute du Code",
        description:
            "Analyse la qualite, l'architecture et la refactorabilite du code en lecture seule.",
        tools: ["grep", "glob", "view"],
        infer: false,
        skills: ["code-therapist"],
        prompt:
            "Tu es le Therapeute du Code, en mode plan et lecture seule. Lis le skill code-therapist, analyse le perimetre fourni, puis rends un diagnostic avec causes racines, severites et recommandations. Ne modifie jamais aucun fichier.",
    },
    {
        name: "diagnostician",
        displayName: "Diagnosticien des Tests",
        description:
            "Evalue et execute les tests unitaires en lecture seule, en detectant les tests lents.",
        tools: ["grep", "glob", "view", "bash"],
        infer: false,
        skills: ["test-diagnostician"],
        prompt:
            "Tu es le Diagnosticien des Tests, en mode plan et lecture seule. Lis le skill test-diagnostician et applique toute sa checklist. Ton avis critique sur la qualite des tests reste prioritaire : pertinence des scenarios, robustesse, isolation, assertions, maintenabilite et detection des tautologies. La duree est un axe complementaire, pas un substitut a cette revue. Identifie le framework puis lance les tests unitaires pertinents avec l'outil d'execution, sans modifier les fichiers. Mesure la duree de chaque test lorsque possible. Signale tout test depassant 5 secondes comme anomalie de performance, ainsi que les suites lentes, les timeouts et les blocages. Signale tout test tautologique comme harmful, avec une severite minimale IMPORTANT. Ne modifie jamais aucun fichier.",
    },
    {
        name: "surgeon",
        displayName: "Chirurgien",
        description:
            "Execute uniquement une prescription validee avec le consentement explicite de l'utilisateur.",
        tools: ["grep", "glob", "view", "edit", "bash"],
        infer: false,
        skills: ["surgeon"],
        prompt:
            "Tu es le Chirurgien. Tu es desactive pour l'inference automatique (infer=false). N'interviens que si le message contient une prescription issue d'un diagnostic et un consentement explicite de l'utilisateur. Si l'un des deux manque, refuse d'operer. N'effectue que les changements prescrits, puis verifie le diff et les validations. Ne depasse jamais la prescription.",
    },
];

const runCheckup = async (scope) => {
    await session.send({
        prompt: checkupInstructions(scope),
        source: "system",
        mode: "immediate",
    });
};

const session = await joinSession({
    customAgents,
    skillDirectories: [".github/skills"],
    commands: [
        {
            name: "checkup",
            description:
                "Lance un checkup diagnostique en orchestrant therapist et diagnostician, sans modifier le depot.",
            handler: async ({ args }) => {
                await runCheckup(args?.trim());
            },
        },
    ],
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
            handler: async (args) => {
                await runCheckup(args?.scope);
                return {
                    textResultForLlm:
                        "Le checkup a ete lance dans la session courante. Attends le rapport des sous-agents.",
                    resultType: "success",
                };
            },
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
            await session.log(
                "La Clinique du Code est disponible via la commande /checkup ou l'outil clinic_checkup. Sous-agents : therapist, diagnostician, surgeon."
            );
        },
    },
});

session.on("subagent.started", async (event) => {
    await session.log(`Sous-agent ${event.data.agentDisplayName || event.data.agentName} demarre.`);
});

session.on("subagent.completed", async (event) => {
    await session.log(`Sous-agent ${event.data.agentDisplayName || event.data.agentName} termine.`);
});

session.on("subagent.failed", async (event) => {
    await session.log(
        `Sous-agent ${event.data.agentDisplayName || event.data.agentName} en echec : ${event.data.error}`,
        { level: "error" }
    );
});
