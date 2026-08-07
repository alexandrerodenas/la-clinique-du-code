---
description: Checkup complet de la Clinique du Code. Le Thérapeute du Code examine le code, le Diagnosticien des Tests examine les tests. Périmètre : working tree, chemin, ou branche (diffs). Produit un rapport clinique avec verdict.
agent: build
---

# 🏥 Checkup de la Clinique du Code

Tu ouvres la Clinique du Code. Deux praticiens vont examiner le dossier patient de l'utilisateur : son code récemment développé ou existant.

**Périmètre de la consultation :** $ARGUMENTS
(si vide : couvre le code et les tests développés dans la session courante, ou demande à l'utilisateur de préciser le périmètre)

## Protocole de checkup

1. **Préparation du dossier patient** — Identifie clairement le périmètre :
   - **Working tree / chemin** : `checkup` ou `checkup src/services` → les fichiers du working tree (nouveaux ou modifiés)
   - **Branche** : `checkup branch:<nom>` → les fichiers modifiés par la branche par rapport à la branche de base
   - Les fichiers de tests associés
   - Le type de projet et son contexte (calibrage nécessaire pour les praticiens)

   Pour le **mode branche** :
   - Détermine la base : la branche par défaut du remote (`git remote show origin`, ou `origin/HEAD`)
   - Liste les fichiers concernés : `git diff --name-only <base>...<branche>`
   - Récupère les diffs : `git diff <base>...<branche>`
   - Les praticiens analysent ces diffs (le contexte local peut compléter la lecture si un fichier manque de contexte)

   **Mode branche** : la branche doit être présente en local (fetch au préalable si besoin). Si la branche n'existe pas ou si le diff est vide, préviens l'utilisateur et arrête la consultation.

2. **Consultation du Thérapeute du Code** — Charge le skill `code-therapist` et applique le protocole complet : comprendre le contexte, détecter les problèmes, évaluer la sévérité, diagnostiquer les causes racines, recommander avec trade-offs.

3. **Analyse du Diagnosticien des Tests** — Charge le skill `test-diagnostician` et passe en revue les tests unitaires du périmètre avec sa checklist complète (lisibilité, structure, isolation, pertinence des assertions, etc.).

4. **Rapport de checkup** — Synthétise les deux consultations dans un rapport unique, structuré comme un dossier médical :

```
## 🏥 Rapport de Checkup — La Clinique du Code

### Dossier patient
- Périmètre : ...
- Contexte projet : ...
- Date : ...

### Constat du Thérapeute du Code (code-therapist)
(Synthèse de la consultation : points positifs, constats par sévérité 🔴🟠🟡🔵, cause racine principale)

### Analyse du Diagnosticien des Tests (test-diagnostician)
(Synthèse : verdict du laboratoire, constats, qualité de couverture et de robustesse)

### Verdict global
- ✅ Code sain — rien de bloquant
- ⚠️ Soins nécessaires — problèmes à traiter avant la prochaine itération
- ❌ Hospitalisation — problèmes critiques à traiter immédiatement

### Ordonnance (prochaines étapes)
Priorisées par sévérité, avec trade-offs (coût / risque / bénéfice).
```

## Règles de la clinique

- Ne modifie **jamais** le code pendant un checkup : tu es en diagnostic. Propose des soins, n'opère pas sans l'accord du patient.
- Chaque constat doit avoir un niveau de sévérité (🔴 CRITIQUE / 🟠 IMPORTANT / 🟡 MODÉRÉ / 🔵 MINEUR).
- Les recommandations doivent être contextualisées au projet (POC vs service critique, etc.).
- Un checkup est une invitation à agir, pas une obligation : c'est l'utilisateur qui décide de la suite du traitement.
