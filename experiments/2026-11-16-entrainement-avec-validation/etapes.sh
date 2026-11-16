#!/usr/bin/env bash
# Les trois étapes de X-008 : mettre de côté des régions annotées, les convertir, entraîner sans elles.
# Appelé par essai.sh, depuis villa/vesuvius. Chaque étape saute ce qui est déjà fait : relancer reprend,
# et l'entraînement repart de son dernier point de sauvegarde.
# Le découpage n'est pas le nôtre : c'est l'outil make_validation_mask.py de Hyojun Kwon (khj1222),
# https://github.com/khj1222/vesuvius-challenge au commit c876e01, licence MIT, lancé tel quel.
# Le convertisseur et l'entraînement sont ceux de ScrollPrize/villa (licence MIT), https://github.com/ScrollPrize/villa
set -euo pipefail
ICI="$(dirname "$(realpath "$0")")"
OUTILS="$ICI/../../scripts/wsl"
HARNAIS="$HOME/vesuvius/khj1222-vesuvius-challenge"
SEGMENT="$HOME/vesuvius/ink-dataset/phercparis4/w00_20231016151002"
MASQUE="$SEGMENT/w00_20231016151002_validation_mask"
CONFIG="$ICI/validation-128.json"
SORTIE="runs/validation_128"
APERCU="$ICI/../../local/apercus/X-008-decoupage.png"
etape() { echo "$1 3 étape" > "$EXECUTION_ETAPE"; echo "[$(date +%H:%M:%S)] ===== étape $1/3 : $2 ====="; }

etape 1 "mettre de côté des régions annotées entières"
if [ -f "$MASQUE.tif" ]; then echo "masque déjà écrit, sauté"; else
  mkdir -p "$(dirname "$APERCU")"
  uv run --no-project --with numpy --with scipy --with zarr --with tifffile --with imagecodecs --with pillow \
    python -I "$HARNAIS/tools/make_validation_mask.py" "$SEGMENT" --preview "$APERCU"
fi

etape 2 "convertir le masque au format que lit l'entraînement"
if [ -d "$MASQUE.zarr" ]; then echo "masque déjà converti, sauté"; else
  uv run --extra models python -m vesuvius.ink_detection.preprocessing.create_label_zarrs "$SEGMENT"
fi

etape 3 "entraîner sans les régions mises de côté"
mkdir -p configs "$SORTIE"
if ls "$SORTIE"/ckpt_*.pth >/dev/null 2>&1; then
  bash "$OUTILS/reprendre-entrainement.sh" "$CONFIG"
else
  cp "$CONFIG" configs/validation-128.json
  uv run --extra models python -m vesuvius.ink_detection.training.train configs/validation-128.json
fi
echo "[$(date +%H:%M:%S)] ===== fin de l'entraînement ====="
ls -la "$SORTIE" | grep -v "ckpt_0" || true
cat "$SORTIE/best_checkpoint.json" 2>/dev/null || echo "pas de meilleur point de sauvegarde enregistré"
