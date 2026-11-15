# Ligne de base d'encre : la recette du tutoriel tient-elle sur une carte de 8 Go ?

Piste : `pilotage/pistes/P-420` (entraîner avec 8 Go de mémoire vidéo), au service de `P-310`.

## La question

Le tutoriel d'encre du défi donne une recette d'entraînement mesurée sur une carte H100 de centre
de calcul. Tient-elle sur une RTX 3080 Laptop (8 Go), et à quelle vitesse ?

## La machine

Windows 11, Ubuntu 24.04 sous WSL2, RTX 3080 Laptop 8 Go (environ 1,35 Go déjà pris par
l'affichage de Windows), 6,8 Go de mémoire vive accordés à Ubuntu, plus 12 Go de fichier d'échange.
PyTorch 2.12.1 (CUDA 13.0). villa au commit `2d3fb38`.

## Les entrées

Le segment `w00_20231016151002` de PHerc. Paris. 4, tel que fourni par le défi :

```bash
bash scripts/wsl/telecharger-segment.sh     # 92 Go côté serveur, 147 785 fichiers
bash scripts/wsl/controler-segment.sh       # vérifie que tout est arrivé
```

Le tutoriel annonce environ 25 Go ; le dossier complet en pèse 92.

## La commande

```bash
bash experiments/2026-11-14-ligne-de-base-encre/mesurer.sh experiments/2026-11-14-ligne-de-base-encre/essai-court.json
bash experiments/2026-11-14-ligne-de-base-encre/mesurer.sh experiments/2026-11-14-ligne-de-base-encre/essai-court-128.json
```

`mesurer.sh` lance l'entraînement de villa et relève le pic de mémoire vidéo toutes les deux
secondes. Ces deux essais courts sont celle du tutoriel, limitée à 60 itérations, avec un seul
processus de chargement ; la seconde réduit les blocs de 256 à 128.

## Le résultat

| | Blocs 64 × 256 × 256 (tutoriel) | Blocs 64 × 128 × 128 |
|---|---|---|
| Lot | 2 | 2 |
| Pic de mémoire vidéo | 7 996 Mo sur 8 192 | 4 895 Mo |
| Vitesse | 21,7 s par itération | 3,03 itérations par seconde |
| 20 000 itérations à ce rythme | environ 120 heures | environ 1 h 50 |

Quatre fois moins de données par itération, soixante-six fois plus vite. La lenteur du premier
réglage ne vient donc pas de la puissance de la carte : la mémoire vidéo est saturée. Sous Windows,
le pilote déborde alors sur la mémoire ordinaire, ce qui est très lent (explication probable, non
vérifiée directement).

Avant ces deux essais, un premier lancement avait été tué par le système au bout de 25 secondes,
sans fichier d'échange : le programme avait atteint 4,4 Go de mémoire vive en chargeant les
étiquettes d'une image de 32 249 × 51 380 pixels.

## L'entraînement complet (blocs de 128)

```bash
bash experiments/2026-11-14-ligne-de-base-encre/mesurer.sh experiments/2026-11-14-ligne-de-base-encre/ligne-de-base-128.json
bash experiments/2026-11-14-ligne-de-base-encre/suivre.sh ligne-de-base-128     # pendant qu'il tourne
```

| | Mesuré |
|---|---|
| Itérations | 20 000, sans interruption ni erreur |
| Durée | 1 h 53 min 51 s (2,93 itérations par seconde en moyenne) |
| Pic de mémoire vidéo | 4 959 Mo |
| Blocs d'entraînement tirés du segment | 8 098 |
| Sauvegardes | 20 fichiers de 816 Mo (16 Go), hors du dépôt |
| Perte d'entraînement, moyenne des 1 000 premières itérations | 0,514 |
| Perte d'entraînement, moyenne des 1 000 dernières | 0,393 |

La perte moyenne reste autour de 0,48 jusqu'à l'itération 15 000, puis descend sur les 5 000
dernières. Au tout premier pas, un gradient non fini a été détecté et le pas a été sauté
(`gradient_health.json`) ; cela ne s'est pas reproduit sur les 200 pas contrôlés.

**Aucune mesure de qualité n'existe pour ce modèle.** La configuration du tutoriel ne réserve
aucune zone de validation : le programme saute alors la validation et n'écrit aucun aperçu
(`train_previews/` et `val_previews/` sont vides). La perte ci-dessus est calculée sur les données
d'entraînement : elle dit que le modèle apprend quelque chose, pas qu'il sait reconnaître de
l'encre ailleurs.

## Ce que ça ne dit pas

- La qualité du modèle : inconnue tant qu'aucune prédiction n'a été regardée, et une prédiction
  sur le segment d'entraînement ne prouvera rien sur un autre segment.
- Des blocs de 128 voient moins de contexte que des blocs de 256 : l'effet sur le résultat reste à mesurer.
- La vitesse a été mesurée avec un seul processus de chargement des données ; elle peut changer avec plus.
- Un lot plus grand avec des blocs de 128 (4 ou 8) n'a pas été essayé.

## Le rendu dans l'IHM

`execution.yaml` décrit ces deux exécutions (X-001 les essais courts, X-002 l'entraînement complet)
pour l'onglet « Exécutions » : ce qui a été produit, le code annoté ligne par ligne, les sorties.

## Ce qui n'est pas de nous

- Le programme d'entraînement et de prédiction, le modèle et ses valeurs par défaut : [`ScrollPrize/villa`](https://github.com/ScrollPrize/villa), licence MIT, au commit `2d3fb38`.
- Les trois fichiers de réglage `.json` : la configuration du [tutoriel d'encre](https://scrollprize.org/tutorial5) du Vesuvius Challenge. Nous y avons changé la taille des blocs, le nombre de processus de chargement et, pour les essais courts, le nombre d'itérations.
- Le segment et ses étiquettes : fournis par le Vesuvius Challenge.
- De nous : les scripts de mesure et de lancement, les mesures, et leur lecture.
