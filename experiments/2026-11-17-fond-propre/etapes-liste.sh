#!/usr/bin/env bash
# Les quatre étapes de X-014. Appelé par entrainer-liste.sh, depuis villa/vesuvius. Chaque étape saute ce
# qui est déjà fait : relancer reprend.
# liste_blocs.py, verifier_blocs.py et mesurer_carres.py sont les nôtres. L'entraînement et la prédiction
# sont ceux de ScrollPrize/villa (licence MIT), https://github.com/ScrollPrize/villa. La notation est celle
# des outils de Hyojun Kwon (khj1222), https://github.com/khj1222/vesuvius-challenge au commit c876e01,
# licence MIT, depuis la copie de X-009 où seul le nom du paquet de villa est remplacé.
set -euo pipefail
ICI="$(dirname "$(realpath "$0")")"
OUTILS="$ICI/../../scripts/wsl"
ADAPTE="$HOME/vesuvius/khj1222-adapte/tools"
SEGMENT="$HOME/vesuvius/ink-dataset/phercparis4/w00_20231016151002"
NOM="$(basename "$SEGMENT")"
SORTIE="runs/fond_propre_liste_128"
LISTE="$SORTIE/blocs.json"
CARRES="$PWD/runs/fond_propre_128_carres"
NOTES="$PWD/runs/fond_propre_liste_128_notes"
VUE="$PWD/runs/fond_propre_liste_128_a_noter"
PY=(uv run --extra models --with zarr --with scipy --with tifffile --with imagecodecs --with pillow python)
etape() { echo "$1 4 étape" > "$EXECUTION_ETAPE"; echo "[$(date +%H:%M:%S)] ===== étape $1/4 : $2 ====="; }
mesurer() { "${PY[@]}" -I "$ICI/mesurer_carres.py" "$1" "$ICI/candidats.json" "$ICI/choix.json" "$2" "$3"; }

etape 1 "écrire la liste de blocs et vérifier que villa la prend"
mkdir -p "$SORTIE" "$NOTES" "$VUE" configs
cp "$ICI/fond-propre-liste-128.json" configs/fond-propre-liste-128.json
if [ -s "$LISTE" ]; then echo "liste déjà écrite, gardée"; else
  python3 "$ICI/liste_blocs.py" \
    "$(ls runs/fond_propre_128_compte/flat_ink_patches_*mlc-0.0*labels-v2.json)" \
    "$(ls runs/fond_propre_128/flat_ink_patches_*mlc-0.05*labels-v2.json)" \
    "$ICI/candidats.json" "$ICI/choix.json" "$LISTE"
fi
uv run --extra models python "$ICI/verifier_blocs.py" configs/fond-propre-liste-128.json "$LISTE"

etape 2 "entraîner sur cette liste"
if ls "$SORTIE"/ckpt_*.pth >/dev/null 2>&1; then
  if [ -f "$SORTIE/ckpt_020000.pth" ]; then echo "entraînement déjà terminé, sauté"; else
    bash "$OUTILS/reprendre-entrainement.sh" "$ICI/fond-propre-liste-128.json"
  fi
else
  uv run --extra models python -m vesuvius.ink_detection.training.train configs/fond-propre-liste-128.json
fi
cat "$SORTIE/best_checkpoint.json" 2>/dev/null || echo "pas de meilleur point de sauvegarde enregistré"

etape 3 "noter les derniers points de sauvegarde sur les régions mises de côté"
for pas in 017000 018000 019000 020000; do ln -sf "$PWD/$SORTIE/ckpt_$pas.pth" "$VUE/ckpt_$pas.pth"; done
"${PY[@]}" "$ADAPTE/sweep_checkpoints.py" "$VUE" "$SEGMENT" --out-dir "$NOTES" --batch-size 4 \
  --no-image-metrics --keep-going
cat "$NOTES/summary.csv"

etape 4 "le chiffre d'après : le meilleur de ces points sur les carrés"
read -r MEILLEUR SEUIL < <(python3 - "$NOTES/summary.csv" <<'PY'
import csv, sys
lignes = list(csv.DictReader(open(sys.argv[1])))
m = max(lignes, key=lambda l: float(l["f1"]))
print(f"{int(m['step']):06d}", m["threshold"])
PY
)
echo "meilleur F1 : itération $MEILLEUR, seuil $SEUIL"
if [ -s "$CARRES/apres-liste.tif" ]; then echo "apres-liste.tif déjà écrit, sauté"; else
  "${PY[@]}" -m vesuvius.ink_detection.inference.infer "$SEGMENT/$NOM.zarr" "$PWD/$SORTIE/ckpt_$MEILLEUR.pth" \
    "$CARRES/apres-liste.tif" --mask-path "$CARRES/carres.tif" --batch-size 4 --no-compile
fi
mesurer "$CARRES/avant.tif" 176 "avant (X-008, itération 19 000), rappel de X-012"
mesurer "$CARRES/apres-liste.tif" 176 "après (itération $MEILLEUR, au seuil de X-008)"
mesurer "$CARRES/apres-liste.tif" "$SEUIL" "après (itération $MEILLEUR, à son seuil)"
du -sh "$SORTIE" "$NOTES" "$CARRES"
df -h /mnt/c | tail -1
echo "[$(date +%H:%M:%S)] ===== fin ====="
