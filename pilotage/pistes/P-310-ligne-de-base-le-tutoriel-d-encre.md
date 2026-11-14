---
id: P-310
titre: "Ligne de base : le tutoriel d'encre"
type: piste
domaine: encre
statut: en-cours
parent: P-300
date: 2026-11-14
source: https://scrollprize.org/tutorial5
---

## Constat

Le tutoriel entraîne un modèle d'encre sur un segment de PHerc. Paris. 4 (environ 25 Go) puis lance une prédiction. Il suppose Linux (WSL2 sous Windows) et une carte NVIDIA avec CUDA. Au 2026-11-14, rien n'a encore été lancé de notre côté.

## Cause racine

Sans ligne de base reproduite chez nous, aucune de nos idées ne peut être comparée à quoi que ce soit.

## Réflexions

- **Agent C.** (2026-11-14) : la machine a une RTX 3080 Laptop (8 Go de mémoire vidéo) et WSL2, mais aucune distribution Ubuntu n'est installée. C'est la première tâche.

- **Agent C.** (2026-11-14) : Ubuntu est en place et voit la carte graphique (T-001). Lecture complète du tutoriel : la recette de base entraîne sur des blocs de 64 × 256 × 256, par lots de 2, pendant 20 000 itérations, soit environ une heure et demie sur une carte H100 de centre de calcul. Sur notre carte ce sera nettement plus long ; durée non mesurée.
- **Agent C.** (2026-11-14) : deux limites de la machine apparaissent avant même de lancer quoi que ce soit, voir F-06 et P-420.

## Suite

Tâches T-001 à T-005.
