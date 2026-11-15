#!/usr/bin/env bash
# Les quatre étapes de l'essai X-004. Appelé par essai.sh, depuis le dossier villa/vesuvius.
# Chaque étape saute ce qui est déjà fait : relancer essai.sh après un arrêt reprend où on en était.
# Le programme lancé n'est pas le nôtre : c'est celui de ScrollPrize/villa (licence MIT), https://github.com/ScrollPrize/villa
set -euo pipefail
ICI="$(dirname "$(realpath "$0")")"
OUTILS="$ICI/../../scripts/wsl"
ZARR="$HOME/vesuvius/ink-dataset/phercparis4/w00_20231016151002/w00_20231016151002.zarr"
CKPT="runs/ligne_de_base_128/ckpt_020000.pth"
SORTIE="predictions/essai-pause-reprise"
export ZONE="16000 16512 25600 27648"
OPTIONS=(--overlap 0.5 --blend-mode hann --batch-size 4 --num-workers 1)
export ETAPES_EXTERNES=1
etape() { echo "$1 4 étape" > "$EXECUTION_ETAPE"; echo "[$(date +%H:%M:%S)] ===== étape $1/4 : $2 ====="; }

etape 1 "la zone d'un seul tenant"
HAUTEUR_BANDE=512 bash "$OUTILS/predire-par-bandes.sh" "$ZARR" "$CKPT" "$SORTIE/un-seul-tenant" "${OPTIONS[@]}"

etape 2 "la même zone en deux bandes"
HAUTEUR_BANDE=256 bash "$OUTILS/predire-par-bandes.sh" "$ZARR" "$CKPT" "$SORTIE/deux-bandes" "${OPTIONS[@]}"

etape 3 "les deux images sont-elles identiques ?"
uv run --no-project --with numpy --with tifffile --with imagecodecs python "$OUTILS/bandes.py" comparer \
  "$SORTIE/un-seul-tenant/assemblee.tif" "$SORTIE/deux-bandes/assemblee.tif"

etape 4 "reprendre un entraînement depuis son dernier point de sauvegarde"
mkdir -p runs/essai_reprise
cp -n runs/ligne_de_base_128/flat_ink_patches_*.json runs/essai_reprise/ 2>/dev/null || true
bash "$OUTILS/reprendre-entrainement.sh" "$ICI/essai-reprise.json" "$CKPT"
echo "[$(date +%H:%M:%S)] ===== fin de l'essai ====="
