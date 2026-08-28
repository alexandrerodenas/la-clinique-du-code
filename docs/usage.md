# 🧭 Utilisation

## La commande `/checkup`

Cette commande est fournie par les adaptateurs OpenCode et GitHub Copilot dans
VS Code. Le protocole de checkup reste réutilisable par d'autres intégrations.

Dans OpenCode, elle est installée comme commande. Dans VS Code, elle est fournie
par le prompt file `.github/prompts/checkup.prompt.md` et apparaît dans le chat
Copilot comme une commande slash.

Une commande, deux praticiens, un rapport.

```bash
/checkup                                # consultation sur le travail de la session
/checkup <chemin>                       # consultation sur un périmètre précis
/checkup branch:<branche>               # consultation sur les diffs d'une branche (vs la base)
```

`/checkup` ouvre le dossier patient, puis :

1. **Le Thérapeute du Code** examine le code source du périmètre ;
2. **Le Diagnosticien des Tests** passe les tests au laboratoire ;
3. La clinique produit un **rapport de checkup** : constats par sévérité, verdict
   global (✅ sain / ⚠️ soins nécessaires / ❌ hospitalisation) et ordonnance priorisée.

> ⚠️ Règle d'or de la clinique : **aucune opération pendant un checkup**. Les
> praticiens diagnostiquent et prescrivent. L'opération (le refactoring) ne se fait
> qu'avec l'accord explicite du patient — l'utilisateur.

## Les consultations à la demande

Chaque praticien est consultable seul, quand vous en avez besoin :

```bash
analyse la zone of pain de ce dépôt    # scan radiologique (churn + couplage)
consultation du nutritionniste sur src/    # vérifier que ce code doit exister
consulte le thérapeute sur mon code    # revue de qualité ciblée
```

Après un développement significatif, votre assistant peut vous **inviter** à lancer un
checkup :

> « Le développement est terminé. Souhaitez-vous que je lance un checkup de la
> Clinique du Code avant la recette ? »

À vous de décider. C'est le contrat.

## Le passage au bloc

Quand un rapport (checkup, consultation, radiologie) contient des soins à opérer,
confiez la prescription au **Chirurgien** :

```bash
fais opérer la prescription du checkup par le chirurgien
```

Le Chirurgien découpe l'ordonnance en lots, dispatch un sous-agent par lot, vérifie
les diffs et les tests, puis rend un compte rendu post-opératoire. Jamais d'opération
sans prescription validée — et jamais d'opération au-delà de la prescription.
