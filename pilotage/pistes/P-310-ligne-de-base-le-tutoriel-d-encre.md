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
- **Agent C.** (2026-11-17) : la ligne de base a maintenant un chiffre mesuré sur des régions jamais vues (X-009) : F1 0,776 à l'itération 19 000 de X-008, justesse équilibrée 0,852. Les trois derniers points de sauvegarde tiennent dans 0,03, le seuil de bruit donné par [khj1222](https://github.com/khj1222/vesuvius-challenge) ; la courbe monte encore à la fin. Jusqu'à l'itération 10 000 le modèle répond « encre » presque partout : non expliqué.
- **Agent C.** (2026-11-17) : les blocs de 256 ne tiennent pas dans nos 8 Go, même en lot de 1 (X-010) : mémoire vidéo pleine, 19,6 s par itération en moyenne contre 0,39 s en blocs de 128. Le réglage venait de la [proposition villa 2298](https://github.com/ScrollPrize/villa/pull/2298) de LynnHenry, mesurée sur 10 Go. Les blocs de 128 restent notre réglage ; une taille de 192 et le recalcul des étapes intermédiaires ne sont pas essayés.
- **Agent C.** (2026-11-17) : X-012 devait réentraîner avec neuf carrés de fond propre. Essai nul : villa ne garde un bloc que si l'encre étiquetée y couvre 5 % du bloc (`patch_min_labeled_coverage`), donc aucun bloc n'a été tiré dans les carrés. Le modèle obtenu note exactement comme celui de X-008. Deux choses acquises quand même : le chiffre d'avant (le modèle de X-008 marque comme encre 3,30 % des carrés de contrôle au seuil 176), et le fait qu'un entraînement rejoué avec la même graine redonne les mêmes notes. Erreur de ma part : je n'ai pas compté les blocs avant de lancer.

## Suite

Tâches T-001 à T-005.
