#!/usr/bin/env bash
# L'étape unique de X-013. Appelé par compter.sh, depuis villa/vesuvius.
# compter_blocs.py est le nôtre ; la recherche de blocs est celle de ScrollPrize/villa (licence MIT),
# https://github.com/ScrollPrize/villa.
set -euo pipefail
ICI="$(dirname "$(realpath "$0")")"
AVANT="$(ls "$PWD"/runs/fond_propre_128/flat_ink_patches_*mlc-0.05*labels-v2.json)"
echo "1 1 étape" > "$EXECUTION_ETAPE"
echo "[$(date +%H:%M:%S)] ===== étape 1/1 : compter les blocs, blocs sans encre admis ====="
mkdir -p configs runs/fond_propre_128_compte
cp "$ICI/compte-blocs.json" configs/compte-blocs.json
uv run --extra models python "$ICI/compter_blocs.py" configs/compte-blocs.json "$AVANT" \
  "$ICI/candidats.json" "$ICI/choix.json"
echo "[$(date +%H:%M:%S)] ===== fin ====="
