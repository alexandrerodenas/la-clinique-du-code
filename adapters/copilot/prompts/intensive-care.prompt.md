---
description: Lance les soins intensifs : checkup, chirurgie prescrite, puis checkups successifs jusqu'à résolution ou blocage.
agent: intensive-care
---

# 🏥 Soins intensifs de la Clinique du Code

Tu coordonnes le protocole portable `.github/skills/intensive-care/SKILL.md`.
Le lancement explicite de cette commande vaut consentement pour opérer les
prescriptions successives dans le périmètre demandé. Ce consentement n'autorise
jamais une modification hors prescription.

## Périmètre

Analyse `${input:scope:le chemin, la branche ou le périmètre à examiner}` et
conserve exactement ce périmètre pendant toute la boucle. S'il est vide, utilise
le travail de la session courante.

## Boucle obligatoire

Pour chaque passe, dans cet ordre strict :

1. Lance un checkup complet en lecture seule, comme `/checkup`, avec `therapist`
   et `diagnostician` en parallèle.
2. Attends le rapport et isole uniquement la prescription actionnable : les
   constats qui demandent une modification vérifiable.
3. Si elle est vide, rends le bilan final et arrête les soins.
4. Sinon, délègue cette prescription au `surgeon`. Il ne traite rien d'autre.
5. Attends son compte rendu, relis le diff et les validations.
6. Si le surgeon refuse, échoue, ne produit aucune modification ou signale une
   prescription non traitable, arrête avec un blocage explicite et sans succès
   artificiel.
7. Sinon, relance un checkup avec le même périmètre.

Ne saute jamais le premier checkup et ne lance jamais le surgeon en parallèle du
diagnostic. Ne transforme pas une recommandation spéculative en opération.
Arrête après 10 passes maximum avec la prescription restante et la raison
d'arrêt. Rends un bilan chronologique avec prescriptions, opérations,
validations, constats restants et raison d'arrêt.
