# Core portable

Le dossier `core/` contient les éléments indépendants d'un harnais d'agent :

- les protocoles des praticiens dans `protocols/` ;
- les outils locaux réutilisables dans `tools/` ;
- les principes de fonctionnement de la Clinique.

Un adaptateur est responsable de traduire ces protocoles dans le format attendu
par un assistant de code. L'adaptateur OpenCode se trouve dans
`adapters/opencode/`.

Les protocoles ne supposent ni commande particulière, ni outil de délégation,
ni permission spécifique. L'orchestrateur qui les utilise doit garantir les
contraintes de chaque praticien, notamment l'absence de modification pendant un
diagnostic.
