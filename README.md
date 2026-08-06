# 🏥 La Clinique du Code

> Prenez soin de votre code. Il prendra soin de votre santé mentale.

![Harness](https://img.shields.io/badge/harness-opencode-18181B?logo=opencode&logoColor=white)
![Praticiens](https://img.shields.io/badge/praticiens-2-success)
![Mode](https://img.shields.io/badge/mode-100%25%20manuel-important)
![Checkup](https://img.shields.io/badge/checkup-pr%C3%AAt-blue)
![Langue](https://img.shields.io/badge/langue-Fran%C3%A7ais-9cf)
![License](https://img.shields.io/badge/license-MIT-green)

---

## Pourquoi une clinique ?

Votre code est vivant. Il naît, il évolue, il se dégrade. Comme un patient, il a besoin
de **suivi régulier**, pas seulement de soins d'urgence quand il est déjà en prod et que
ça saigne.

La Clinique du Code est un plugin pour [opencode](https://opencode.ai) qui met à votre
disposition une **équipe de praticiens** — des skills spécialisés — et une **commande de
checkup** pour les faire consulter sur votre code.

Chaque praticien est un expert. La clinique ne fait pas d'opérations à votre place :
elle **diagnostique**, elle **recommande**, et c'est vous qui décidez du traitement.

```
┌─────────────────────────────────────────────┐
│                🏥 LA CLINIQUE DU CODE        │
│                                             │
│   /checkup ────►┌────────────────────────┐  │
│                 │ 🧠 Thérapeute du Code   │  │
│                 │    (code-therapist)     │  │
│                 ├────────────────────────┤  │
│                 │ 🔬 Diagnosticien des    │  │
│                 │    Tests (test-         │  │
│                 │    diagnostician)       │  │
│                 └────────────────────────┘  │
│                        │                    │
│                        ▼                    │
│              📋 Rapport de checkup          │
│              + verdict + ordonnance         │
└─────────────────────────────────────────────┘
```

---

## 👨‍⚕️ Les praticiens

### 🧠 Le Thérapeute du Code — `code-therapist`

> « Racontez-moi ce que fait ce code. Comment vous sentez-vous dans cette méthode de 200 lignes ? »

Le Thérapeute du Code est votre coach senior en **qualité de code**. Il examine votre
patient (le code) comme un psychologue examine son patient : il écoute, il diagnostique,
il soigne.

| Compétences | Traitements |
|---|---|
| Revue de code experte | Refactoring incrémental |
| Analyse d'architecture | Décisions avec trade-offs explicites |
| Détection d'odeurs de code | Priorisation par sévérité (🔴🟠🟡🔵) |
| Évaluation de la lisibilité | Calibrage selon le contexte projet |

Sa philosophie : **contexte > règles, lisibilité > ingéniosité, simple > générique,
évolution > renaissance**. Il ne récite pas SOLID pour faire savant — il l'utilise pour
faire avancer votre code. Et il ne réécrit jamais : il refactore, toujours.

### 🔬 Le Diagnosticien des Tests — `test-diagnostician`

> « On m'a amené vos tests. Pas de panique, je suis équipé. »

Le Diagnosticien des Tests est votre **spécialiste de laboratoire**. Il analyse vos
tests unitaires pour vérifier qu'ils sont dignes de confiance avant la recette.

| Analyses | Verdicts |
|---|---|
| Propriétés fondamentales (rapide, indépendant, répétable...) | ✅ Adopté |
| Structure Given-When-Then | ⚠️ À revoir |
| Pertinence des assertions (« ne jamais faire confiance à un test qu'on n'a pas vu échouer ») | ❌ À refaire |
| Fragilité, couplage à l'implémentation, mutualisation des assets | |

---

## 🩺 La commande `/checkup`

Une commande, deux praticiens, un rapport.

```bash
/checkup                      # tout le travail de la session courante
/checkup src/services         # un périmètre précis
```

`/checkup` ouvre le dossier patient, puis :

1. **Le Thérapeute du Code** examine le code source du périmètre ;
2. **Le Diagnosticien des Tests** passe les tests au laboratoire ;
3. La clinique produit un **rapport de checkup** : constats par sévérité, verdict
   global (✅ sain / ⚠️ soins nécessaires / ❌ hospitalisation) et ordonnance priorisée.

> ⚠️ Règle d'or de la clinique : **aucune opération pendant un checkup**. Les
> praticiens diagnostiquent et prescrivent. L'opération (le refactoring) ne se fait
> qu'avec l'accord explicite du patient — l'utilisateur.

---

## 📋 Installation — Prendre rendez-vous

### Prérequis

- [opencode](https://opencode.ai) installé et fonctionnel

### Étape 1 — Cloner la clinique

```bash
git clone https://github.com/alexandrerodenas/la-clinique-du-code.git
```

### Étape 2 — Installer les praticiens

**Windows (PowerShell) :**

```powershell
.\install.ps1
```

**Linux / macOS (manuel, le script équivalent arrive) :**

```bash
mkdir -p ~/.config/opencode/skills ~/.config/opencode/commands
cp -r skills/code-therapist ~/.config/opencode/skills/
cp -r skills/test-diagnostician ~/.config/opencode/skills/
cp commands/checkup.md ~/.config/opencode/commands/
```

L'installation copie les praticiens (skills) et la commande `/checkup` dans la
configuration globale d'opencode — ils seront disponibles dans tous vos projets.

### Étape 3 — Installer le système prompt de la clinique

Ajoutez le contenu de [`templates/AGENTS.md.clinic`](templates/AGENTS.md.clinic) dans
votre `AGENTS.md` (global ou par projet). C'est ce qui donne à votre assistant la
notion de checkup : savoir **proposer** une consultation après un développement —
jamais l'imposer.

### Étape 4 — Redémarrer opencode

La configuration est chargée au démarrage. Quittez et relancez opencode.

---

## 🧭 Utilisation

```bash
/checkup                                # consultation sur le travail de la session
/checkup <chemin>                       # consultation sur un périmètre précis
```

Après un développement significatif, votre assistant peut vous **inviter** à lancer un
checkup :

> « Le développement est terminé. Souhaitez-vous que je lance un checkup de la
> Clinique du Code avant la recette ? »

À vous de décider. C'est le contrat.

---

## ⚖️ La philosophie : 100 % manuel

La Clinique du Code ne s'invite jamais dans votre flux de travail.

- **Vous décidez quand** lancer un checkup — après une feature, un refactoring, ou
  quand votre code a l'air malade.
- **L'assistant peut suggérer**, jamais contraindre. Son rôle se limite à un rappel
  doux en fin d'itération.
- **Les praticiens ne modifient jamais le code** — ils diagnostiquent, et vous opérez
  si vous le souhaitez.

Pas de CI intrusive, pas de hook qui juge, pas de robot qui pleure dans vos pull
requests. Juste une équipe de praticiens compétents, disponibles quand vous les appelez.

---

## 🚑 Recrutement — La clinique grandit

L'équipe actuelle compte deux praticiens, mais la clinique est ouverte. Les prochains
spécialistes potentiels :

| Poste | Spécialité |
|---|---|
| 🛡️ Le Garde-Fou de la Sécurité | analyse des vulnérabilités, secrets, injection |
| ⚡ Le Kiné des Performances | analyses N+1, complexité algorithmique, cache |
| 🏗️ L'Architecte des Frontières | cohésion des modules, découplage, dépendances |
| ♿ Le Docteur de l'Accessibilité | WCAG, usages handicapés |
| 📦 Le Diététicien des Dépendances | poids, obsolescence, licenses |

Un repo ouvert à la contribution : vous pouvez proposer un nouveau praticien en créant
un skill dans `skills/<nom>/SKILL.md` et sa fiche dans ce README.

---

## 📝 Licence

[MIT](LICENSE) — la Clinique est ouverte à tous, les soins sont gratuits.
