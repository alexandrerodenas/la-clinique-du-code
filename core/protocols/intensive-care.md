---
name: intensive-care
description: Protocole portable des soins intensifs de la Clinique du Code. Enchaîne checkup et chirurgie jusqu'à disparition de la prescription actionnable.
---

# Protocole des soins intensifs

Les soins intensifs sont un parcours explicite, lancé uniquement par l'utilisateur.
Ils enchaînent un checkup en lecture seule et une intervention du Chirurgien, puis
recommencent jusqu'à ce que le dernier checkup ne contienne plus de prescription
actionnable.

## Conditions d'entrée

- Le mode est lancé par une commande explicite de l'utilisateur.
- Le périmètre est celui fourni à la commande ; s'il est vide, utilise le
  périmètre de la session courante.
- Le lancement explicite vaut consentement pour opérer les prescriptions
  successives produites dans ce périmètre. Ce consentement ne permet pas
  d'élargir le périmètre ni de traiter autre chose que la prescription courante.

## Boucle de soins

Pour chaque passe :

1. Lance un **checkup complet** en lecture seule, avec le même périmètre.
2. Attends son rapport et isole uniquement les recommandations actionnables :
   les constats qui prescrivent une modification vérifiable.
3. Si aucune prescription actionnable ne reste, arrête les soins et rends le
   bilan final.
4. Transmets cette prescription au **Chirurgien** avec le consentement explicite
   fourni par le mode soins intensifs.
5. Le Chirurgien opère uniquement les lots prescrits, vérifie chaque lot et rend
   son compte rendu.
6. Si le Chirurgien refuse, échoue, ne produit aucune modification ou signale
   qu'il ne peut pas traiter la prescription, arrête la boucle et signale
   clairement le blocage.
7. Sinon, relance un checkup avec le même périmètre.

Le rapport de chaque passe doit être conservé dans le compte rendu final :
prescription reçue, opérations effectuées, vérifications, constats restants et
raison d'arrêt.

## Garde-fous

- Ne lance jamais le Chirurgien avant d'avoir obtenu le rapport du checkup.
- Ne considère pas une recommandation future, spéculative ou non actionnable comme
  une raison de poursuivre la chirurgie.
- N'élargis jamais le périmètre et ne traite jamais une amélioration opportuniste.
- Arrête la boucle après 10 passes maximum pour éviter une récursion sans fin.
  Dans ce cas, indique que le patient reste à revoir et liste la prescription
  restante.
- Un checkup reste strictement sans modification ; seul le Chirurgien peut opérer.
- Si un checkup ou une intervention échoue, n'ignore pas l'erreur et n'affiche pas
  de succès : arrête les soins avec l'erreur et l'état connu.

## Bilan final

Rends un bilan chronologique indiquant :

- le périmètre ;
- le nombre de passes ;
- les prescriptions et opérations de chaque passe ;
- les validations exécutées ;
- les constats restants ;
- la raison d'arrêt : patient sain, blocage, absence de progrès ou limite de
  passes atteinte.
