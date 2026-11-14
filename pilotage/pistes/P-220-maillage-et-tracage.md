---
id: P-220
titre: "Maillage et traçage"
type: piste
domaine: depliage
statut: a-explorer
parent: P-200
date: 2026-11-14
source: https://scrollprize.org/2026_open_problems
---

## Constat

Les outils GrowPatch, Copy Out/In et Lasagna (dans VC3D) étendent un maillage le long de la surface prédite. Le résultat est encore semi-automatique.

## Cause racine

Trois erreurs reviennent : les trous, les fusions de feuilles voisines et les sauts d'une feuille à l'autre. Une erreur dans un maillage source se propage aux spires copiées.
