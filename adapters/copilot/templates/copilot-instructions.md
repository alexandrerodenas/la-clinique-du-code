# 🏥 La Clinique du Code

Ce projet utilise la Clinique du Code. Elle intervient **après** le développement,
sur décision de l'utilisateur, comme filet de sécurité post-traitement.

- Ne lance jamais un checkup ou une consultation de toi-même.
- Tu peux proposer le prompt `checkup` après un développement significatif ; l'utilisateur décide.
- Le prompt `intensive-care` (ou `/soins-intensifs`) est un parcours explicite :
  checkup, chirurgie prescrite, puis checkups successifs jusqu'à résolution ou
  blocage. Ne le lance jamais de toi-même.
- Les agents `therapist`, `diagnostician`, `radiologist` et `nutritionist` sont en mode plan : ils ne modifient jamais le code.
- Le `radiologist` et le `nutritionist` sont des experts à la demande ; ils ne font pas partie du protocole `/checkup`.
- L'agent `surgeon` ne modifie le code qu'après une prescription explicitement validée par l'utilisateur.
- Chaque constat indique une sévérité et une recommandation avec coût, risque et bénéfice.
- Un test tautologique est **harmful** et doit être signalé au minimum comme 🟠 IMPORTANT.

Les protocoles détaillés sont disponibles dans `.github/skills/`.
