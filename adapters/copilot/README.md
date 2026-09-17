# Adaptateur GitHub Copilot

Cet adaptateur traduit les protocoles portables de `core/` dans les conventions
de GitHub Copilot. Il prend en charge l'application GitHub Copilot et GitHub
Copilot dans VS Code :

- `.github/skills/` pour les protocoles des praticiens ;
- `.github/extensions/la-clinique-du-code/extension.mjs` pour le plugin natif
  de l'application GitHub Copilot ;
- `.github/agents/` pour les praticiens spécialisés ;
- `.github/prompts/checkup.prompt.md` pour le checkup manuel ;
- `.github/agents/checkup.agent.md` pour coordonner les consultations ;
- `.github/copilot-instructions.md` pour le rappel de la philosophie de la
  Clinique.

L'analyseur de zones de douleur est copié dans
`.github/skills/zone-of-pain/zone-of-pain-analyzer.js`.

## Installation

Depuis la racine de la Clinique :

```powershell
.\adapters\copilot\install.ps1 -ProjectRoot C:\chemin\du\projet
```

Le script crée ou met à jour uniquement les fichiers de la Clinique dans le
projet cible. Il ne lance pas de consultation automatiquement.

Dans l'application GitHub Copilot, l'extension enregistre la vraie commande
`/checkup` (avec son argument de périmètre) et expose aussi l'outil
`clinic_checkup` pour les hôtes qui ne présentent pas les commandes natives.
L'extension enregistre la commande native `/checkup` et le coordinateur lance le
diagnostic dans la session courante. Le Diagnosticien peut lancer les tests unitaires en lecture
seule et signale tout test dépassant 5 secondes, ainsi que les timeouts et
blocages. Cette mesure complète son avis critique sur la pertinence, robustesse,
isolation et maintenabilité des tests ; elle ne le remplace pas. Tous les agents
de la Clinique sont user-invocable et désactivés pour l'invocation automatique
par le modèle ; `surgeon` est disponible uniquement sur invocation explicite,
avec prescription et consentement. Aucun champ `model` n'est envoyé : chaque
sous-agent hérite du modèle de la session parente.

Le hook `onUserPromptSubmitted` reste un pont de compatibilité pour les versions
du CLI qui ne présentent pas encore les commandes natives. Dans VS Code avec
GitHub Copilot, le prompt apparaît comme la commande `/checkup` et les agents
apparaissent dans le sélecteur d'agents.
