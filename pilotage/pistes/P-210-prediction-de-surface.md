---
id: P-210
titre: "Prédiction de surface"
type: piste
domaine: depliage
statut: a-explorer
parent: P-200
date: 2026-11-14
source: https://scrollprize.org/2026_open_problems
---

## Constat

Un réseau 3D (U-Net) prédit, voxel par voxel, où se trouve la face écrite du papyrus. La recette gagnante du concours Kaggle de 2025 : nnU-Net, entraîné très longtemps, plusieurs modèles moyennés.

## Cause racine

Une petite erreur locale (trou, fusion de deux feuilles) suffit à envoyer le traçage sur la mauvaise spire. La précision par voxel ne mesure pas ce risque : c'est la topologie qui compte.
