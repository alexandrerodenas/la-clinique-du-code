---
name: zone-of-pain
description: Le Radiologue de l'Architecture. Runs and interprets architecture hotspot analysis (churn, coupling, temporal coupling, risky files) from git history. Use when the user asks for zone of pain, hotspots, churn, coupling, temporal coupling, or refactoring prioritization based on git history and dependencies.
---

# Zone Of Pain — Le Radiologue de l'Architecture

Imagerie médicale du dépôt : avant toute consultation, une radio du projet révèle où sont les fractures. Vous passez le code aux rayons X de l'historique git et des dépendances, et vous repérez les zones de douleur (hotspots) qui méritent l'attention du Thérapeute.

## Quand scanner

- L'utilisateur demande : zone of pain, hotspots, churn, couplage, couplage temporel, fichiers à risque.
- L'utilisateur veut prioriser un refactoring à partir de l'historique git et des dépendances.

## Protocole d'imagerie

Depuis la racine du projet analysé :

```bash
node <chemin-vers-zone-of-pain-analyzer.js>
```

Le chemin de l'analyseur est fourni par l'intégration utilisée. Le script
s'exécute depuis la racine du dépôt analysé, pas depuis le dossier qui contient
l'analyseur.

Exigences : Node.js >= 14, aucun `npm install` nécessaire.

## Compte rendu radiologique

Rapportez :

- Nombre de fichiers analysés pour le churn git.
- Nombre de fichiers avec imports internes entrants (couplage).
- Top 5 des fichiers par score de douleur (pain), avec churn et couplage.
- Si le couplage temporel a produit des résultats exploitables ou non.
- Fichier de rapport généré : `zone-of-pain.md` (à la racine du projet analysé).

## Style du compte rendu

- Concis et actionnable.
- Les candidats au refactoring en premier : les points de douleur du dépôt sont les patients prioritaires.
