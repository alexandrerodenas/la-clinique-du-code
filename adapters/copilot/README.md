# Adaptateur GitHub Copilot

Cet adaptateur traduit les protocoles portables de `core/` dans les conventions
de GitHub Copilot :

- `.github/skills/` pour les protocoles des praticiens ;
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

Dans VS Code avec GitHub Copilot, le prompt apparaît comme la commande `/checkup`
dans le chat. Les agents apparaissent dans le sélecteur d'agents.
