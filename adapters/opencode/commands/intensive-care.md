---
description: Lance les soins intensifs : checkup, chirurgie prescrite, puis checkups successifs jusqu'à résolution ou blocage.
agent: build
---

# 🏥 Soins intensifs de la Clinique du Code

Tu coordonnes le protocole portable `intensive-care` en mode build.
Commence par lire le skill `intensive-care`, puis applique-le sans modifier le
code pendant les checkups.

## Périmètre

Le périmètre demandé est : `$ARGUMENTS`.
S'il est vide, utilise le travail de la session courante. Conserve exactement ce
périmètre pendant toute la boucle.

## Protocole obligatoire

Pour chaque passe, dans cet ordre strict :

1. Lance un checkup complet en lecture seule, en déléguant `therapist` et
   `diagnostician` en parallèle comme pour `/checkup`.
2. Attends le rapport complet. Isole sa prescription actionnable : uniquement
   les constats qui demandent une modification vérifiable.
3. Si la prescription est vide, rends le bilan final et arrête.
4. Si elle n'est pas vide, délègue immédiatement cette prescription au
   `surgeon`. L'appel explicite de cette commande vaut consentement pour les
   prescriptions successives dans ce périmètre ; le surgeon ne doit toutefois
   rien traiter en dehors de la prescription.
5. Attends le compte rendu du surgeon, relis le diff et les validations.
6. Si le surgeon refuse, échoue, ne produit aucune modification ou signale une
   prescription non traitable, arrête avec un blocage explicite. N'affiche pas
   de succès.
7. Sinon, reboucle sur un nouveau checkup avec le même périmètre.

Ne saute jamais le premier checkup, ne lance jamais le surgeon en parallèle du
diagnostic et ne transforme pas une recommandation spéculative en opération.
Arrête après 10 passes maximum avec la prescription restante et la raison
d'arrêt si la boucle n'est pas terminée. Rends un bilan chronologique avec les
prescriptions, opérations, validations, constats restants et la raison d'arrêt.
