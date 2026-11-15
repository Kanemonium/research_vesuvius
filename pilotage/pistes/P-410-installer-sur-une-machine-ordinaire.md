---
id: P-410
titre: "Installer sur une machine ordinaire"
type: piste
domaine: outils
statut: en-cours
parent: P-400
date: 2026-11-14
source: https://scrollprize.org/winners
---

## Constat

En octobre 2026, 32 contributions ont été primées, dont plusieurs correctifs de compatibilité Windows, Mac ou AMD à 250 $.

## Cause racine

Les outils du défi sont écrits pour Linux et pour de grosses cartes graphiques. Nous travaillons sous Windows 11 : nous rencontrerons ces défauts avant d'autres.

## Réflexions

- **Agent C.** (2026-11-14) : à ne pas forcer. L'équipe ne prime que les correctifs de défauts réellement rencontrés, avec preuve avant/après.
- **Agent C.** (2026-11-14) : premiers obstacles réels, rencontrés en suivant le tutoriel d'encre à la lettre sur un Ubuntu 24.04 neuf (WSL2), villa au commit `2d3fb38`. La commande `uv sync --extra models` a échoué trois fois avant de passer.
  1. **Bibliothèques système absentes.** La commande compile sur place deux composants C++ (`vc-object-store`, `volume-cartographer`). Sans SQLite, puis sans Ceres, la configuration s'arrête. Le dépôt contient un script qui installe tout (`volume-cartographer/scripts/install_build_deps.sh minimal-build`), mais la page du tutoriel d'encre ne le mentionne pas. Il faut en plus `libboost-dev`.
  2. **Mémoire saturée.** La compilation lance une tâche par cœur : 27 compilateurs pour 6,8 Go de mémoire, plus rien n'avançait. À 4 tâches, un compilateur a encore été tué par le système. À 2 tâches (`CMAKE_BUILD_PARALLEL_LEVEL=2`), elle passe.
  3. **Délai réseau.** Un fichier CUDA de PyTorch a dépassé le délai par défaut de `uv` ; `UV_HTTP_TIMEOUT=900` règle le problème. Cause probable : notre téléchargement de données en parallèle, donc pas un défaut du dépôt.
- **Kanemonium** (2026-11-15) : avons-nous utilisé l'outil qui ne télécharge que les blocs utiles à l'entraînement, et qui ferait passer le jeu de données de 92 Go à 2,4 Go ?
- **Agent C.** (2026-11-15) : non, tout le dossier du segment a été téléchargé. L'outil que cite le tutoriel, `download_required_zarr_chunks`, s'applique au mode 3D natif : il copie les blocs du volume d'origine du rouleau, pas ceux du volume de surface que nous utilisons. Je n'ai pas trouvé la source du chiffre de 2,4 Go. L'ordre de grandeur est plausible pour l'entraînement seul (estimation : 8 098 blocs décalés de 64 pixels sur 65 couches, environ 2 Go avant compression), mais une prédiction sur tout le segment lit tout le niveau le plus fin, 63 Go. À vérifier avant de proposer quoi que ce soit à villa.

## Suite

Les points 1 et 2 sont des candidats à une contribution : une note dans le tutoriel d'encre, et une limite de tâches par défaut quand la mémoire est faible. Avant de proposer quoi que ce soit, vérifier dans les issues de villa et sur Discord que ce n'est pas déjà connu, et reproduire sur une installation propre. Notre script `scripts/wsl/installer-villa.sh` contient déjà les trois contournements.
