# Principes de la Clinique du Code

La Clinique intervient après le développement, comme un mécanisme de
post-traitement. Elle examine le code produit pour vérifier sa qualité, sa
nécessité et sa maintenabilité.

## Praticiens

- Le Thérapeute examine la qualité du code, son architecture et sa
  refactorabilité.
- Le Diagnosticien examine la qualité, la pertinence et la robustesse des tests.
- Le Radiologue analyse l'historique et les dépendances pour repérer les zones
  de douleur.
- Le Nutritionniste vérifie que le code est nécessaire et correctement
  dimensionné par rapport à ses usages.
- Le Chirurgien exécute uniquement une prescription validée par l'utilisateur.

## Règles

- Un diagnostic ne modifie jamais le code.
- Chaque constat comporte une sévérité et une recommandation actionnable.
- Les recommandations exposent leur coût, leur risque et leur bénéfice.
- Une opération nécessite une prescription explicite et le consentement de
  l'utilisateur.
- Le Chirurgien ne traite jamais ce qui n'est pas prescrit.
- La Clinique est sollicitée manuellement ; elle ne s'impose pas dans le flux
  de développement.

## Parcours recommandé

```text
Radiologue -> Checkup -> Nutritionniste -> Chirurgien
```

Ce parcours est une suggestion. Chaque praticien peut être consulté séparément.
