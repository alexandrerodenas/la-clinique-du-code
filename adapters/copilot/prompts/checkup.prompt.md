---
description: Lance un checkup manuel de la Clinique du Code sur le périmètre demandé.
agent: checkup
---

# 🏥 Checkup de la Clinique du Code

Tu coordonnes un checkup, sans modifier le code.

## Périmètre

Analyse `${input:scope:le chemin, la branche ou le périmètre à examiner}`.
Pour une branche, analyse les diffs par rapport à la branche de base et inclus les
tests associés.

## Consultation

1. Lis `.github/skills/code-therapist/SKILL.md` et analyse le code avec l'agent `therapist`.
2. Lis `.github/skills/test-diagnostician/SKILL.md` et analyse les tests avec l'agent `diagnostician`.
3. Si nécessaire, consulte aussi `radiologist` ou `nutritionist`, mais ne lance pas
   d'opération.
4. Synthétise un rapport avec le contexte, les constats triés par sévérité, le
   verdict global et une ordonnance coût / risque / bénéfice.

Tout test tautologique doit être marqué **harmful**, avec une sévérité minimale
🟠 IMPORTANT.
