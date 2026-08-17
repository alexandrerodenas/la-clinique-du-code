# 📋 Installation — Prendre rendez-vous

## Architecture

Le cœur portable se trouve dans `core/`. Il contient les protocoles des
praticiens et l'analyseur de zones de douleur. Les fichiers spécifiques à
OpenCode sont regroupés dans `adapters/opencode/`.

Cette page documente l'installation de cet adaptateur. Un autre assistant peut
réutiliser `core/` en fournissant sa propre intégration.

## Prérequis

- [OpenCode](https://opencode.ai) installé et fonctionnel pour l'adaptateur décrit ici

## Étape 1 — Cloner la clinique

```bash
git clone https://github.com/alexandrerodenas/la-clinique-du-code.git
```

## Étape 2 — Installer l'adaptateur OpenCode

**Windows (PowerShell) :**

```powershell
.\install.ps1
```

L'installation copie les protocoles du `core/` au format skill OpenCode, ainsi
que les agents, la commande `/checkup` et l'outil d'analyse associé dans la
configuration globale d'OpenCode — ils seront
disponibles dans tous vos projets.

## Étape 3 — Installer le système prompt de la clinique

Ajoutez le contenu de [`adapters/opencode/templates/AGENTS.md.clinic`](../adapters/opencode/templates/AGENTS.md.clinic)
dans votre `AGENTS.md` (global ou par projet). C'est ce qui donne à votre assistant la
notion de checkup : savoir **proposer** une consultation après un développement —
jamais l'imposer.

## Étape 4 — Redémarrer OpenCode

La configuration est chargée au démarrage. Quittez et relancez OpenCode.

---

## 🤖 Installation par un agent de code (from scratch)

Pas envie de le faire à la main ? Copiez-collez le prompt suivant dans votre
assistant de code. Il installe la clinique tout seul, étape par étape :

```text
Tu vas installer « La Clinique du Code » (un kit portable avec un adaptateur OpenCode : des praticiens
[skills] + des agents [mode plan + chirurgien] + la commande /checkup + un système
prompt) depuis le dépôt
https://github.com/alexandrerodenas/la-clinique-du-code.git

Suis ces étapes exactement, dans l'ordre :

1. Clone le dépôt dans un dossier temporaire :
   git clone https://github.com/alexandrerodenas/la-clinique-du-code.git <tmp>

2. Détermine le dossier de configuration global d'OpenCode :
   - Windows : %USERPROFILE%\.config\opencode\
   - Linux / macOS : ~/.config/opencode/
   (appelons-le <config>)

3. Installe tous les protocoles comme skills :
   - pour chaque fichier <tmp>\core\protocols\<nom>.md, crée
     <config>\skills\<nom>\SKILL.md (code-therapist, test-diagnostician,
     zone-of-pain, nutritionist, et tous ceux qui apparaîtront à l'avenir)
   - copie <tmp>\core\tools\zone-of-pain-analyzer.js vers
     <config>\skills\zone-of-pain\zone-of-pain-analyzer.js

4. Installe les agents :
   - crée le dossier <config>\agent (ou agents)
   - copie chaque fichier <tmp>\adapters\opencode\agents\<nom>.md vers <config>\agent\<nom>.md
     (therapist, diagnostician, radiologist, nutritionist, surgeon,
     et tous ceux qui apparaîtront à l'avenir)

5. Installe la commande /checkup :
   - copie <tmp>\adapters\opencode\commands\checkup.md vers <config>\commands\checkup.md

6. Installe le système prompt de la clinique :
    - lis le fichier <tmp>\adapters\opencode\templates\AGENTS.md.clinic
   - ajoute son contenu à la fin du fichier <config>\AGENTS.md
     (en retirant la première ligne d'en-tête « # Ce bloc est à ajouter dans le
     fichier AGENTS.md de votre projet. »)
   - si <config>\AGENTS.md n'existe pas, crée-le avec ce contenu

7. Nettoie le dossier temporaire <tmp>.

8. Vérifie que tous les praticiens, les agents et la commande sont en place, et
   que le bloc clinique est bien présent dans AGENTS.md. Annonce le résultat.

9. Préviens l'utilisateur : il doit quitter et redémarrer OpenCode pour que la
   Clinique prenne effet.

Si tu détectes d'anciens praticiens installés ailleurs (par exemple
~/.agents/skills/code-therapy, ~/.agents/skills/test-diagnostics ou
~/.agents/skills/zone-of-pain), demande à l'utilisateur s'il veut les supprimer
avant de terminer.
```

Ce prompt fonctionne sur n'importe quel assistant de code disposant d'un shell
(Windows, Linux ou macOS) : il ne présuppose ni script, ni outil spécifique.
