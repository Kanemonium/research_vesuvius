#!/usr/bin/env bash
# Prédiction d'encre découpée en bandes horizontales, pour pouvoir l'arrêter et la reprendre.
# Le programme de prédiction de villa ne sait pas reprendre : arrêté, il repart de zéro. Mais il sait
# ne traiter qu'un rectangle (--roi), en gardant le contexte autour. On traite donc le segment bande
# par bande ; une bande finie est gardée, et un nouveau lancement reprend à la première bande manquante.
# À la fin, les bandes sont assemblées en une seule image.
# Le programme lancé n'est pas le nôtre : c'est celui de ScrollPrize/villa (licence MIT), https://github.com/ScrollPrize/villa
#
# Usage : bash predire-par-bandes.sh <volume.zarr> <point de sauvegarde> <dossier de sortie> [options de infer…]
#   HAUTEUR_BANDE=2048       hauteur d'une bande, en pixels
#   ZONE="l0 l1 c0 c1"       ne prédire que ce rectangle (lignes l0 à l1, colonnes c0 à c1) ; par défaut, tout
# À lancer depuis villa/vesuvius, de préférence par lancer-execution.sh.
set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"
ZARR="${1:?volume manquant}"; CKPT="${2:?point de sauvegarde manquant}"; SORTIE="${3:?dossier de sortie manquant}"
shift 3
ICI="$(dirname "$(realpath "$0")")"
HAUTEUR_BANDE="${HAUTEUR_BANDE:-2048}"
read -r HAUT LARGE < <(python3 -c "import json,sys; s=json.load(open(sys.argv[1]))['shape']; print(s[-2], s[-1])" "$ZARR/0/.zarray")
read -r L0 L1 C0 C1 <<< "${ZONE:-0 $HAUT 0 $LARGE}"
mkdir -p "$SORTIE"
TOTAL=$(( (L1 - L0 + HAUTEUR_BANDE - 1) / HAUTEUR_BANDE ))
echo "Zone : lignes $L0 à $L1, colonnes $C0 à $C1 (image de $HAUT × $LARGE). $TOTAL bande(s) de $HAUTEUR_BANDE lignes."

K=0
for (( l = L0; l < L1; l += HAUTEUR_BANDE )); do
  K=$(( K + 1 ))
  fin=$(( l + HAUTEUR_BANDE < L1 ? l + HAUTEUR_BANDE : L1 ))
  bande="$SORTIE/bande-$(printf '%06d' "$l")-$(printf '%06d' "$fin").tif"
  [ -z "${ETAPES_EXTERNES:-}" ] && [ -n "${EXECUTION_ETAPE:-}" ] && echo "$K $TOTAL bande" > "$EXECUTION_ETAPE"
  if [ -f "$bande.fait" ]; then
    echo "[$(date +%H:%M:%S)] bande $K/$TOTAL (lignes $l à $fin) : déjà faite, sautée"
    continue
  fi
  echo "[$(date +%H:%M:%S)] bande $K/$TOTAL (lignes $l à $fin) : début"
  rm -f "$bande"
  uv run --extra models python -m vesuvius.ink_detection.inference.infer "$ZARR" "$CKPT" "$bande" --roi "$l" "$fin" "$C0" "$C1" "$@"
  date +%Y-%m-%dT%H:%M:%S%:z > "$bande.fait"
  echo "[$(date +%H:%M:%S)] bande $K/$TOTAL : terminée"
done

echo "[$(date +%H:%M:%S)] assemblage des $TOTAL bande(s)"
uv run --no-project --with numpy --with tifffile --with imagecodecs python "$ICI/bandes.py" assembler "$SORTIE" "$SORTIE/assemblee.tif" "$L0" "$L1" "$C0" "$C1"
echo "[$(date +%H:%M:%S)] image assemblée : $SORTIE/assemblee.tif"
