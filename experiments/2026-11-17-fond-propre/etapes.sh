#!/usr/bin/env bash
# L'étape de X-011 : chercher des carrés candidats et en faire une planche. Appelé par essai.sh.
# Le script candidats.py est le nôtre. Il relit la carte d'encre de X-003, calculée par le programme de
# ScrollPrize/villa (licence MIT), et les étiquettes du tutoriel d'encre du défi.
set -euo pipefail
ICI="$(dirname "$(realpath "$0")")"
SEGMENT="$HOME/vesuvius/ink-dataset/phercparis4/w00_20231016151002"
CARTE="$PWD/predictions/w00_20231016151002/assemblee.tif"
echo "1 1 étape" > "$EXECUTION_ETAPE"
echo "[$(date +%H:%M:%S)] ===== étape 1/1 : chercher des carrés loin de toute annotation ====="
uv run --no-project --with numpy --with scipy --with zarr --with tifffile --with imagecodecs --with pillow \
  python -I "$ICI/candidats.py" "$CARTE" "$SEGMENT/w00_20231016151002_supervision_mask.tif" \
  "$SEGMENT/w00_20231016151002.zarr" "$ICI/../../local/apercus" "$ICI/candidats.json"
echo "[$(date +%H:%M:%S)] ===== fin ====="
