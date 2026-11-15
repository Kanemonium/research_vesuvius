#!/usr/bin/env bash
# Prédiction d'encre sur le segment du tutoriel, avec le dernier point de sauvegarde de X-002. Le programme lancé n'est pas le nôtre : c'est celui de ScrollPrize/villa (licence MIT), https://github.com/ScrollPrize/villa
# À lancer depuis Ubuntu : bash experiments/2026-11-14-ligne-de-base-encre/predire.sh
set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"
ICI="$(dirname "$(realpath "$0")")"
SEGMENT="$HOME/vesuvius/ink-dataset/phercparis4/w00_20231016151002"

bash "$ICI/../../scripts/wsl/ajouter-echange.sh" >/dev/null
cd "$HOME/vesuvius/villa/vesuvius"
mkdir -p predictions

bash "$ICI/../../scripts/wsl/lancer-execution.sh" X-003 "$ICI" \
  uv run --extra models python -m vesuvius.ink_detection.inference.infer \
    "$SEGMENT/w00_20231016151002.zarr" \
    runs/ligne_de_base_128/ckpt_020000.pth \
    predictions/w00_20231016151002.tif \
    --overlap 0.5 --blend-mode hann \
    --batch-size 4
