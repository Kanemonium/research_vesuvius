#!/usr/bin/env bash
# Les deux étapes de X-009 : noter un point de sauvegarde de X-008 pour essai, puis tous.
# Appelé par essai.sh, depuis villa/vesuvius. Une prédiction déjà écrite est gardée : relancer reprend.
# La notation n'est pas la nôtre : ce sont les outils sweep_checkpoints.py et eval_validation.py de
# Hyojun Kwon (khj1222), https://github.com/khj1222/vesuvius-challenge au commit c876e01, licence MIT.
# Ils appellent le paquet de villa sous son ancien nom : une copie gardée hors du dépôt reçoit ce seul
# changement de nom, rien d'autre. La prédiction est celle de ScrollPrize/villa (licence MIT).
set -euo pipefail
HARNAIS="$HOME/vesuvius/khj1222-vesuvius-challenge"
ADAPTE="$HOME/vesuvius/khj1222-adapte/tools"
SEGMENT="$HOME/vesuvius/ink-dataset/phercparis4/w00_20231016151002"
ENTRAINEMENT="$PWD/runs/validation_128"
VUE="$PWD/runs/validation_128_a_noter"
NOTES="$PWD/runs/validation_128_notes"
etape() { echo "$1 2 étape" > "$EXECUTION_ETAPE"; echo "[$(date +%H:%M:%S)] ===== étape $1/2 : $2 ====="; }
noter() {
  uv run --extra models --with zarr --with scipy --with tifffile --with imagecodecs --with pillow \
    python "$ADAPTE/sweep_checkpoints.py" "$1" "$SEGMENT" --out-dir "$NOTES" --batch-size 4 \
    --no-image-metrics "${@:2}"
}

mkdir -p "$ADAPTE" "$VUE" "$NOTES"
for outil in sweep_checkpoints eval_validation; do
  sed 's/koine_machines/vesuvius.ink_detection/g' "$HARNAIS/tools/$outil.py" > "$ADAPTE/$outil.py"
done
# Les vingt points de sauvegarde, plus celui que villa a gardé à part : il date de l'itération 17 500.
for point in "$ENTRAINEMENT"/ckpt_*.pth; do ln -sf "$point" "$VUE/$(basename "$point")"; done
ln -sf "$ENTRAINEMENT/best_val_balanced_accuracy.pth" "$VUE/ckpt_017500.pth"

etape 1 "essai sur le dernier point de sauvegarde"
mkdir -p "$VUE-essai"
ln -sf "$ENTRAINEMENT/ckpt_020000.pth" "$VUE-essai/ckpt_020000.pth"
noter "$VUE-essai"
ls -la "$NOTES"

etape 2 "noter les vingt et un points de sauvegarde"
noter "$VUE" --keep-going
echo "[$(date +%H:%M:%S)] ===== fin de la notation ====="
cat "$NOTES/summary.csv"
du -sh "$NOTES"
cp "$NOTES/curve.png" "$(dirname "$(realpath "$0")")/../../local/apercus/X-009-courbe.png"
