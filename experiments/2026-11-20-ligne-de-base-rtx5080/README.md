# Ligne de base d'encre, refaite sur la nouvelle machine

Piste : `pilotage/pistes/P-420`, tâche `T-021`. Rendu : X-015 (`execution.yaml`). Référence : X-002.

## La question

Le 2026-11-19, le projet a changé de machine (A-409). Que donne exactement le même entraînement
qu'en X-002 sur la nouvelle carte : combien de temps, combien de mémoire vidéo, et la même courbe
de perte ? C'est le nouveau point de comparaison pour tous les essais qui suivront.

## La machine

Windows 11, Ubuntu 24.04.5 sous WSL2, RTX 5080 16 Go, 16 cœurs, 22 Go de mémoire vive accordés à
Ubuntu, plus 16 Go d'échange. PyTorch 2.12.1 (CUDA 13.0), comme en X-002. villa au commit `0bddf27`.
Le code d'encre de villa (`vesuvius/src/vesuvius/ink_detection`) est identique, fichier pour fichier,
à celui du commit `2d3fb38` utilisé en X-002 (comparé le 2026-11-20).

## Les entrées

Le segment `w00_20231016151002` de PHerc. Paris. 4, retéléchargé le 2026-11-20 :

```bash
bash scripts/wsl/telecharger-segment.sh
bash scripts/wsl/controler-segment.sh
```

## La commande

```bash
bash experiments/2026-11-20-ligne-de-base-rtx5080/entrainer.sh
```

Le réglage `ligne-de-base-128-rtx5080.json` est celui de X-002, à une ligne près : le dossier de
sortie, pour ne pas écraser le modèle de X-002. Après un arrêt, relancer la même commande reprend
au dernier point de sauvegarde.
