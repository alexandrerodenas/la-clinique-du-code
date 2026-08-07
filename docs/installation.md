# 📋 Installation — Prendre rendez-vous

## Prérequis

- [opencode](https://opencode.ai) installé et fonctionnel

## Étape 1 — Cloner la clinique

```bash
git clone https://github.com/alexandrerodenas/la-clinique-du-code.git
```

## Étape 2 — Installer les praticiens

**Windows (PowerShell) :**

```powershell
.\install.ps1
```

**Linux / macOS (manuel, le script équivalent arrive) :**

```bash
mkdir -p ~/.config/opencode/skills ~/.config/opencode/commands ~/.config/opencode/agent
for skill in skills/*/; do cp -r "$skill" ~/.config/opencode/skills/; done
cp commands/checkup.md ~/.config/opencode/commands/
cp agents/*.md ~/.config/opencode/agent/
```

L'installation copie les praticiens (skills), les agents (mode plan + chirurgien) et
la commande `/checkup` dans la configuration globale d'opencode — ils seront
disponibles dans tous vos projets.

## Étape 3 — Installer le système prompt de la clinique

Ajoutez le contenu de [`templates/AGENTS.md.clinic`](../templates/AGENTS.md.clinic)
dans votre `AGENTS.md` (global ou par projet). C'est ce qui donne à votre assistant la
notion de checkup : savoir **proposer** une consultation après un développement —
jamais l'imposer.

## Étape 4 — Redémarrer opencode

La configuration est chargée au démarrage. Quittez et relancez opencode.

---

## 🤖 Installation par un agent de code (from scratch)

Pas envie de le faire à la main ? Copiez-collez le prompt suivant dans votre
assistant de code. Il installe la clinique tout seul, étape par étape :

```text
Tu vas installer « La Clinique du Code » (un plugin opencode : des praticiens
[skills] + des agents [mode plan + chirurgien] + la commande /checkup + un système
prompt) depuis le dépôt
https://github.com/alexandrerodenas/la-clinique-du-code.git

Suis ces étapes exactement, dans l'ordre :

1. Clone le dépôt dans un dossier temporaire :
   git clone https://github.com/alexandrerodenas/la-clinique-du-code.git <tmp>

2. Détermine le dossier de configuration global d'opencode :
   - Windows : %USERPROFILE%\.config\opencode\
   - Linux / macOS : ~/.config/opencode/
   (appelons-le <config>)

3. Installe tous les praticiens (skills) :
   - pour chaque dossier <tmp>\skills\<nom>, copie-le récursivement vers
     <config>\skills\<nom> (code-therapist, test-diagnostician, zone-of-pain,
     nutritionist, et tous ceux qui apparaîtront à l'avenir)

4. Installe les agents :
   - crée le dossier <config>\agent (ou agents)
   - copie chaque fichier <tmp>\agents\<nom>.md vers <config>\agent\<nom>.md
     (therapist, diagnostician, radiologist, nutritionist, surgeon,
     et tous ceux qui apparaîtront à l'avenir)

5. Installe la commande /checkup :
   - copie <tmp>\commands\checkup.md vers <config>\commands\checkup.md

6. Installe le système prompt de la clinique :
   - lis le fichier <tmp>\templates\AGENTS.md.clinic
   - ajoute son contenu à la fin du fichier <config>\AGENTS.md
     (en retirant la première ligne d'en-tête « # Ce bloc est à ajouter dans le
     fichier AGENTS.md de votre projet. »)
   - si <config>\AGENTS.md n'existe pas, crée-le avec ce contenu

7. Nettoie le dossier temporaire <tmp>.

8. Vérifie que tous les praticiens, les agents et la commande sont en place, et
   que le bloc clinique est bien présent dans AGENTS.md. Annonce le résultat.

9. Préviens l'utilisateur : il doit quitter et redémarrer opencode pour que la
   Clinique prenne effet.

Si tu détectes d'anciens praticiens installés ailleurs (par exemple
~/.agents/skills/code-therapy, ~/.agents/skills/test-diagnostics ou
~/.agents/skills/zone-of-pain), demande à l'utilisateur s'il veut les supprimer
avant de terminer.
```

Ce prompt fonctionne sur n'importe quel assistant de code disposant d'un shell
(Windows, Linux ou macOS) : il ne présuppose ni script, ni outil spécifique.
