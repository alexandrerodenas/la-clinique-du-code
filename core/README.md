# Core portable

Le dossier `core/` contient les éléments indépendants d'un harnais d'agent :

- les protocoles des praticiens dans `protocols/` ;
- les outils locaux réutilisables dans `tools/` ;
- les principes de fonctionnement de la Clinique.

Le protocole `intensive-care` décrit le parcours explicite qui enchaîne un
checkup, le Chirurgien et de nouveaux checkups jusqu'à disparition de la
prescription actionnable. Chaque adaptateur traduit ce protocole dans son propre
format de commande, sans changer ses garde-fous.

Un adaptateur est responsable de traduire ces protocoles dans le format attendu
par un assistant de code. Les adaptateurs OpenCode et GitHub Copilot se trouvent
respectivement dans `adapters/opencode/` et `adapters/copilot/`.

Les protocoles ne supposent ni commande particulière, ni outil de délégation,
ni permission spécifique. L'orchestrateur qui les utilise doit garantir les
contraintes de chaque praticien, notamment l'absence de modification pendant un
diagnostic.
