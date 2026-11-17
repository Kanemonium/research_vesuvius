#!/usr/bin/env bash
# Les six étapes de X-012. Appelé par entrainer.sh, depuis villa/vesuvius. Chaque étape saute ce qui est
# déjà fait : relancer reprend.
# masques.py et mesurer_carres.py sont les nôtres. Le convertisseur, l'entraînement et la prédiction sont
# ceux de ScrollPrize/villa (licence MIT), https://github.com/ScrollPrize/villa. La notation est celle des
# outils de Hyojun Kwon (khj1222), https://github.com/khj1222/vesuvius-challenge au commit c876e01,
# licence MIT, depuis la copie de X-009 où seul le nom du paquet de villa est remplacé.
set -euo pipefail
ICI="$(dirname "$(realpath "$0")")"
OUTILS="$ICI/../../scripts/wsl"
ADAPTE="$HOME/vesuvius/khj1222-adapte/tools"
SEGMENT="$HOME/vesuvius/ink-dataset/phercparis4/w00_20231016151002"
NOM="$(basename "$SEGMENT")"
REFERENCE="$PWD/runs/validation_128/ckpt_019000.pth"
SORTIE="runs/fond_propre_128"
CARRES="$PWD/runs/fond_propre_128_carres"
NOTES="$PWD/runs/fond_propre_128_notes"
VUE="$PWD/runs/fond_propre_128_a_noter"
PY=(uv run --extra models --with zarr --with scipy --with tifffile --with imagecodecs --with pillow python)
etape() { echo "$1 6 étape" > "$EXECUTION_ETAPE"; echo "[$(date +%H:%M:%S)] ===== étape $1/6 : $2 ====="; }
predire() {  # <point de sauvegarde> <sortie.tif> : seulement dans les carrés
  [ -s "$2" ] && { echo "$(basename "$2") déjà écrit, sauté"; return; }
  "${PY[@]}" -m vesuvius.ink_detection.inference.infer "$SEGMENT/$NOM.zarr" "$1" "$2" \
    --mask-path "$CARRES/carres.tif" --batch-size 4 --no-compile
}
mesurer() { "${PY[@]}" -I "$ICI/mesurer_carres.py" "$1" "$ICI/candidats.json" "$ICI/choix.json" "$2" "$3"; }

etape 1 "écrire les étiquettes en version 2"
mkdir -p "$CARRES" "$NOTES" "$VUE" configs
"${PY[@]}" -I "$ICI/masques.py" "$SEGMENT" "$ICI/candidats.json" "$ICI/choix.json" "$CARRES/carres.tif"

etape 2 "convertir les nouveaux fichiers au format de l'entraînement"
if [ -d "$SEGMENT/${NOM}_supervision_mask_v2.zarr" ] && [ -d "$SEGMENT/${NOM}_inklabels_v2.zarr" ] \
   && [ -d "$SEGMENT/${NOM}_validation_mask_v2.zarr" ]; then echo "déjà convertis, sauté"; else
  uv run --extra models python -m vesuvius.ink_detection.preprocessing.create_label_zarrs "$SEGMENT"
fi

etape 3 "le chiffre d'avant : le modèle de X-008 sur les carrés"
predire "$REFERENCE" "$CARRES/avant.tif"
mesurer "$CARRES/avant.tif" 176 "avant (X-008, itération 19 000)"

etape 4 "entraîner avec le fond propre"
if ls "$SORTIE"/ckpt_*.pth >/dev/null 2>&1; then
  if [ -f "$SORTIE/ckpt_020000.pth" ]; then echo "entraînement déjà terminé, sauté"; else
    bash "$OUTILS/reprendre-entrainement.sh" "$ICI/fond-propre-128.json"
  fi
else
  mkdir -p "$SORTIE"
  cp "$ICI/fond-propre-128.json" configs/fond-propre-128.json
  uv run --extra models python -m vesuvius.ink_detection.training.train configs/fond-propre-128.json
fi
cat "$SORTIE/best_checkpoint.json" 2>/dev/null || echo "pas de meilleur point de sauvegarde enregistré"

etape 5 "noter les derniers points de sauvegarde sur les régions mises de côté"
for pas in 017000 018000 019000 020000; do ln -sf "$PWD/$SORTIE/ckpt_$pas.pth" "$VUE/ckpt_$pas.pth"; done
"${PY[@]}" "$ADAPTE/sweep_checkpoints.py" "$VUE" "$SEGMENT" --out-dir "$NOTES" --batch-size 4 \
  --no-image-metrics --keep-going
cat "$NOTES/summary.csv"

etape 6 "le chiffre d'après : le meilleur de ces points sur les carrés"
read -r MEILLEUR SEUIL < <(python3 - "$NOTES/summary.csv" <<'PY'
import csv, sys
lignes = list(csv.DictReader(open(sys.argv[1])))
m = max(lignes, key=lambda l: float(l["f1"]))
print(f"{int(m['step']):06d}", m["threshold"])
PY
)
echo "meilleur F1 : itération $MEILLEUR, seuil $SEUIL"
predire "$PWD/$SORTIE/ckpt_$MEILLEUR.pth" "$CARRES/apres.tif"
mesurer "$CARRES/apres.tif" "$SEUIL" "après (itération $MEILLEUR, à son seuil)"
mesurer "$CARRES/apres.tif" 176 "après (itération $MEILLEUR, au seuil de X-008)"
du -sh "$SORTIE" "$NOTES" "$CARRES"
df -h /mnt/c | tail -1
echo "[$(date +%H:%M:%S)] ===== fin ====="
