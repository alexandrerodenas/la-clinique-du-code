import { joinSession } from "@github/copilot-sdk/extension";

const checkupInstructions = (scope) => `Tu coordonnes un checkup de La Clinique du Code en mode diagnostic, sans modifier le code.

Perimetre a examiner : ${scope || "le travail de la session courante"}.

Lis les protocoles necessaires dans .github/skills/ puis delegue en parallele :
1. le Therapeute du Code (agent therapist) pour le code et l'architecture ;
2. le Diagnosticien des Tests (agent diagnostician) pour les tests.
Les deux agents sont strictement en lecture seule. Le radiologist et le
nutritionist sont des experts a la demande et ne font pas partie du protocole
de checkup.

Rends un rapport avec le contexte, les constats tries par severite, les fichiers et lignes concernes, le verdict global et une ordonnance priorisee avec cout, risque et benefice. Un test tautologique est harmful et doit etre signale au minimum comme IMPORTANT.

Ne modifie jamais le code, les tests ou la configuration pendant ce checkup.
Ne demande pas au surgeon d'intervenir pendant le checkup.`;

const intensiveCareInstructions = (scope) => `Tu coordonnes les soins intensifs de La Clinique du Code.

Lis .github/skills/intensive-care/SKILL.md et conserve ce perimetre pendant toute
la boucle : ${scope || "le travail de la session courante"}.

Le lancement explicite de ce mode vaut consentement pour operer les prescriptions
successives dans ce perimetre. Ce consentement n'autorise jamais une
modification hors prescription.

Pour chaque passe, dans cet ordre strict :
1. Lance un checkup complet en lecture seule, comme /checkup, avec therapist et
   diagnostician en parallele.
2. Attends le rapport complet et isole uniquement les recommandations
   actionnables, c'est-a-dire les constats qui demandent une modification
   verifiable.
3. Si la prescription actionnable est vide, rends le bilan final et arrete.
4. Sinon, delegue exactement cette prescription au surgeon. Il ne traite rien
   d'autre.
5. Attends son compte rendu, relis le diff et les validations.
6. Si le surgeon refuse, echoue, ne produit aucune modification ou signale une
   prescription non traitable, arrete avec un blocage explicite. N'affiche pas
   de succes artificiel.
7. Sinon, relance un checkup avec le meme perimetre.

Ne saute jamais le premier checkup et ne lance jamais le surgeon en parallele du
diagnostic. Ne transforme pas une recommandation speculative en operation.
Arrete apres 10 passes maximum avec la prescription restante et la raison
d'arret. Rends un bilan chronologique avec prescriptions, operations,
validations, constats restants et raison d'arret.`;

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
        name: "radiologist",
        displayName: "Radiologue de l'Architecture",
        description:
            "Analyse l'historique Git et les dependances pour reperer les zones de douleur.",
        tools: ["grep", "glob", "view", "bash"],
        infer: false,
        skills: ["zone-of-pain"],
        prompt:
            "Tu es le Radiologue de l'Architecture, en mode plan et lecture seule. Lis le skill zone-of-pain, execute son analyseur depuis la racine du projet, puis rends un compte rendu avec le churn, le couplage et les zones de douleur. Ne modifie jamais le code.",
    },
    {
        name: "nutritionist",
        displayName: "Nutritionniste du Projet",
        description:
            "Verifie que le code analyse est necessaire et correctement dimensionne.",
        tools: ["grep", "glob", "view"],
        infer: false,
        skills: ["nutritionist"],
        prompt:
            "Tu es le Nutritionniste du Projet, en mode plan et lecture seule. Lis le skill nutritionist, questionne les usages reels et identifie le code mort, la speculation ou la sur-ingenierie. Ne modifie jamais le code.",
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
            "Tu es le Chirurgien. Tu es desactive pour l'inference automatique (infer=false). N'interviens que si le message contient une prescription issue d'un diagnostic et un consentement explicite de l'utilisateur. Le mode intensive-care, lance explicitement par l'utilisateur, fournit ce consentement pour la prescription courante et les prescriptions successives dans le meme perimetre. Si la prescription ou le consentement manque, refuse d'operer. N'effectue que les changements prescrits, puis verifie le diff et les validations. Ne depasse jamais la prescription.",
    },
];

const runCheckup = async (scope) => {
    await session.log(
        `Checkup lance sur ${scope || "le travail de la session courante"}. Les praticiens restent en lecture seule.`
    );
    return session.send({
        prompt: checkupInstructions(scope),
        source: "system",
        mode: "immediate",
    });
};

const runIntensiveCare = async (scope) => {
    await session.log(
        `Soins intensifs lances sur ${scope || "le travail de la session courante"}. La boucle checkup/chirurgie est active.`
    );
    return session.send({
        prompt: intensiveCareInstructions(scope),
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
        {
            name: "intensive-care",
            description:
                "Lance les soins intensifs : checkup, chirurgie prescrite et checkups successifs jusqu'a resolution ou blocage.",
            handler: async ({ args }) => {
                await runIntensiveCare(args?.trim());
            },
        },
        {
            name: "soins-intensifs",
            description:
                "Alias francais de la commande intensive-care.",
            handler: async ({ args }) => {
                await runIntensiveCare(args?.trim());
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
        {
            name: "clinic_intensive_care",
            description:
                "Lance les soins intensifs et boucle entre checkup et surgeon jusqu'a resolution ou blocage.",
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
                await runIntensiveCare(args?.scope);
                return {
                    textResultForLlm:
                        "Les soins intensifs ont ete lances. Attends le bilan de chaque checkup et du surgeon.",
                    resultType: "success",
                };
            },
        },
    ],
    hooks: {
        onUserPromptSubmitted: async (input) => {
            const match = input.prompt.match(
                /^\/(checkup|intensive-care|soins-intensifs)(?:\s+([\s\S]*))?$/i
            );
            if (!match) {
                return;
            }

            if (match[1].toLowerCase() !== "checkup") {
                return {
                    modifiedPrompt: intensiveCareInstructions(match[2]?.trim()),
                };
            }

            return {
                modifiedPrompt: checkupInstructions(match[2]?.trim()),
            };
        },
        onSessionStart: async () => {
            await session.log(
                "La Clinique du Code est disponible via /checkup, /intensive-care, /soins-intensifs, les outils clinic_checkup et clinic_intensive_care. Sous-agents : therapist, diagnostician, radiologist, nutritionist, surgeon."
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
