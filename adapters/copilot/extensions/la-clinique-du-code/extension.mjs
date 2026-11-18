import { joinSession } from "@github/copilot-sdk/extension";

// La Clinique du Code — extension for the GitHub Copilot application.
// The protocols live in .github/skills/ (installed by adapters/copilot); this
// extension only registers commands, tools and subagents that point to them.

const describeScope = (scope) => scope || "le travail de la session courante (sinon les modifications non commitees)";

const PROTOCOLS = {
    checkup: (scope) => `Tu coordonnes un checkup de La Clinique du Code.

Lis .github/skills/checkup/SKILL.md et applique-le integralement au perimetre : ${describeScope(scope)}.

Delegue en parallele au subagent therapist et au subagent diagnostician, avec des briefs complets (listes de fichiers, contexte du projet, contrat fonctionnel ou "aucun contrat disponible") : ils ne peuvent pas poser de questions. Ne modifie jamais le code, les tests ou la configuration pendant un checkup et ne fais pas appel au surgeon. Termine par l'ordonnance proposee : l'utilisateur approuve tout ou une selection par identifiant (T1, D2...). Reponds en francais.`,

    intensiveCare: (scope) => `Tu coordonnes les soins intensifs de La Clinique du Code.

Lis .github/skills/intensive-care/SKILL.md et .github/skills/checkup/SKILL.md, puis applique strictement le protocole de soins intensifs au perimetre : ${describeScope(scope)}. Garde ce perimetre identique a chaque passe.

Le lancement explicite de ce mode vaut consentement pour operer les constats 🔴/🟠 de chaque passe dans ce perimetre, et rien d'autre. Checkup (therapist + diagnostician en parallele), puis surgeon sur les seuls constats 🔴/🟠 actionnables, jamais en parallele. Arrete-toi des qu'il n'en reste plus, en cas de refus, d'echec, de regression ou d'absence de progres, ou a 10 passes. N'annonce jamais un succes non verifie. Reponds en francais.`,

    securityCheckup: (scope) => `Tu coordonnes un checkup de securite de La Clinique du Code.

Resous le perimetre comme le decrit .github/skills/checkup/SKILL.md : ${describeScope(scope)}. Delegue ensuite au subagent immunologist avec la liste des fichiers modifies et la commande de diff ; il ne peut pas poser de questions. Rends son rapport tel quel. Ne modifie jamais le code. Si l'utilisateur veut traiter les constats, le rapport sert d'ordonnance au surgeon.`,
};

const readOnly = ["grep", "glob", "view"];
const readAndRun = [...readOnly, "bash"];

const practitioner = (name, displayName, description, skill, tools, extra = "") => ({
    name,
    displayName,
    description,
    tools,
    infer: false,
    skills: [skill],
    prompt: `Tu es ${displayName}, praticien de La Clinique du Code. Lis le skill ${skill} (.github/skills/${skill}/SKILL.md) et applique-le integralement au perimetre fourni. Tu ne peux pas poser de questions a l'utilisateur : deduis le contexte du depot et indique tes hypotheses. Chaque constat a un identifiant, un emplacement path:ligne, une severite et un compromis cout/risque/benefice. ${extra}`.trim(),
});

const customAgents = [
    practitioner("therapist", "Therapeute du Code", "Qualite, architecture, refactorabilite et conformite a la demande, en lecture seule.", "code-therapist", readOnly,
        "Si aucun contrat fonctionnel n'est fourni, indique que la conformite n'a pas ete evaluee. Ne modifie jamais aucun fichier."),
    practitioner("diagnostician", "Diagnosticien des Tests", "Pertinence et robustesse des tests, tests tautologiques et tests lents, en lecture seule.", "test-diagnostician", readAndRun,
        "Le shell sert uniquement a lancer les tests existants : n'installe rien, ne mets jamais a jour de snapshot, ne modifie aucun fichier. Un test tautologique est harmful, au minimum IMPORTANT."),
    practitioner("radiologist", "Radiologue de l'Architecture", "Zones de douleur de l'historique git : churn, couplage, couplage temporel.", "zone-of-pain", readAndRun,
        "Le shell sert uniquement a l'analyseur en lecture seule et aux commandes git de lecture. Ne modifie jamais le code."),
    practitioner("nutritionist", "Nutritionniste du Projet", "Code mort, speculation et sur-ingenierie au regard des usages reels.", "nutritionist", readOnly,
        "Etablis les usages reels avant tout jugement. Ne modifie jamais le code."),
    practitioner("immunologist", "Immunologiste", "Menaces de securite atteignables d'un changement, chacune avec un chemin d'attaque.", "immunologist", readAndRun,
        "Le shell sert uniquement aux scanners en lecture seule et aux commandes git de lecture. N'installe rien, n'envoie aucune requete a un systeme en marche, ne modifie jamais le code."),
    practitioner("surgeon", "Chirurgien", "Execute uniquement une ordonnance validee, avec le consentement explicite de l'utilisateur.", "surgeon", [...readAndRun, "edit"],
        "Tu es le seul praticien autorise a modifier le code. N'opere que si le message contient une ordonnance de la Clinique ET le consentement explicite de l'utilisateur (ou le lancement explicite des soins intensifs). Sinon refuse. Prends une baseline des tests avant d'operer, ne traite que les constats approuves, verifie chaque lot et rends le compte rendu operatoire."),
];

const send = async (label, prompt, scope) => {
    await session.log(`${label} lance sur ${describeScope(scope)}.`);
    return session.send({ prompt, source: "system", mode: "immediate" });
};

const run = {
    checkup: (scope) => send("Checkup", PROTOCOLS.checkup(scope), scope),
    "intensive-care": (scope) => send("Soins intensifs", PROTOCOLS.intensiveCare(scope), scope),
    "security-checkup": (scope) => send("Checkup de securite", PROTOCOLS.securityCheckup(scope), scope),
};

const scopeParameter = {
    type: "object",
    properties: {
        scope: {
            type: "string",
            description: "Chemin, branch:<nom> ou perimetre a examiner. Vide pour la session courante.",
        },
    },
    additionalProperties: false,
};

const tool = (name, description, command) => ({
    name,
    description,
    parameters: scopeParameter,
    handler: async (args) => {
        await run[command](args?.scope?.trim());
        return { textResultForLlm: "Lance dans la session courante. Attends les rapports des sous-agents.", resultType: "success" };
    },
});

const command = (name, description) => ({
    name,
    description,
    handler: async ({ args }) => {
        await run[name](args?.trim());
    },
});

const session = await joinSession({
    customAgents,
    skillDirectories: [".github/skills"],
    commands: [
        command("checkup", "Checkup diagnostique : therapist et diagnostician en parallele, sans modifier le depot."),
        command("security-checkup", "Checkup de securite : l'immunologist examine un changement, sans modifier le depot."),
        command("intensive-care", "Soins intensifs : opere uniquement les constats CRITICAL et IMPORTANT, s'arrete quand il n'en reste plus."),
    ],
    tools: [
        tool("clinic_checkup", "Lance le checkup diagnostique de La Clinique du Code, sans modifier le depot.", "checkup"),
        tool("clinic_security_checkup", "Lance le checkup de securite de La Clinique du Code, sans modifier le depot.", "security-checkup"),
        tool("clinic_intensive_care", "Lance les soins intensifs : opere uniquement les constats CRITICAL et IMPORTANT jusqu'a resolution ou blocage.", "intensive-care"),
    ],
    hooks: {
        // Compatibility bridge for CLI versions that do not expose native commands yet.
        onUserPromptSubmitted: async (input) => {
            const match = input.prompt.match(/^\/(checkup|security-checkup|intensive-care)(?:\s+([\s\S]*))?$/i);
            if (!match) return;
            const name = match[1].toLowerCase();
            const scope = match[2]?.trim();
            const prompt =
                name === "checkup" ? PROTOCOLS.checkup(scope)
                : name === "security-checkup" ? PROTOCOLS.securityCheckup(scope)
                : PROTOCOLS.intensiveCare(scope);
            return { modifiedPrompt: prompt };
        },
        onSessionStart: async () => {
            await session.log(
                "La Clinique du Code est disponible : /checkup, /security-checkup, /intensive-care. Praticiens : therapist, diagnostician, radiologist, nutritionist, immunologist, surgeon."
            );
        },
    },
});

for (const [event, verb] of [["subagent.started", "demarre"], ["subagent.completed", "termine"]]) {
    session.on(event, async (e) => {
        await session.log(`Sous-agent ${e.data.agentDisplayName || e.data.agentName} ${verb}.`);
    });
}

session.on("subagent.failed", async (e) => {
    await session.log(`Sous-agent ${e.data.agentDisplayName || e.data.agentName} en echec : ${e.data.error}`, { level: "error" });
});
