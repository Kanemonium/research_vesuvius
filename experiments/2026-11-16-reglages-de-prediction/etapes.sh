#!/usr/bin/env bash
# Les étapes de l'essai X-005 : quatre réglages de prédiction, chacun sur une petite et une grande zone.
# Appelé par essai.sh, depuis le dossier villa/vesuvius. Une mesure déjà faite est sautée : relancer reprend.
# Le programme lancé n'est pas le nôtre : c'est celui de ScrollPrize/villa (licence MIT), https://github.com/ScrollPrize/villa
# Les réglages comparés viennent de la proposition villa 2428 de gomyway : https://github.com/ScrollPrize/villa/pull/2428
set -uo pipefail
ICI="$(dirname "$(realpath "$0")")"
OUTILS="$ICI/../../scripts/wsl"
ZARR="$HOME/vesuvius/ink-dataset/phercparis4/w00_20231016151002/w00_20231016151002.zarr"
CKPT="runs/ligne_de_base_128/ckpt_020000.pth"
SORTIE="predictions/essai-reglages"
COMMUN=(--overlap 0.5 --blend-mode hann --num-workers 1)
PETITE="7000 9048 25600 27648"
GRANDE="7000 9048 25600 33792"
LIMITE=1500
TOTAL=10
export ETAPES_EXTERNES=1
mkdir -p "$SORTIE/journaux"
MESURES="$SORTIE/mesures.tsv"
touch "$MESURES"
etape() { echo "$1 $TOTAL étape" > "$EXECUTION_ETAPE"; echo "[$(date +%H:%M:%S)] ===== étape $1/$TOTAL : $2 ====="; }

# mesurer <numéro> <nom du réglage> <petite|grande> <options de infer…>
mesurer() {
  local k="$1" nom="$2" taille="$3"; shift 3
  local zone="$PETITE"; [ "$taille" = "grande" ] && zone="$GRANDE"
  local dossier="$SORTIE/$nom-$taille" journal="$SORTIE/journaux/$nom-$taille.log" vram="$SORTIE/journaux/$nom-$taille.vram"
  etape "$k" "$nom, $taille zone"
  if grep -q "^$nom	$taille	" "$MESURES"; then echo "déjà mesuré, sauté"; return; fi
  rm -rf "$dossier"; echo 0 > "$vram"
  ( pic=0; while true; do
      m=$(nvidia-smi --query-gpu=memory.used --format=csv,noheader,nounits 2>/dev/null | head -1)
      [ -n "$m" ] && [ "$m" -gt "$pic" ] && pic=$m && echo "$pic" > "$vram"
      sleep 1
    done ) &
  local sonde=$! debut; debut=$(date +%s.%N)
  ZONE="$zone" HAUTEUR_BANDE=2048 timeout "$LIMITE" bash "$OUTILS/predire-par-bandes.sh" "$ZARR" "$CKPT" "$dossier" \
    "${COMMUN[@]}" "$@" 2>&1 | tee "$journal"
  local code=${PIPESTATUS[0]} fin; fin=$(date +%s.%N)
  kill "$sonde" 2>/dev/null
  # Passé la limite, timeout n'arrête que le script : on arrête aussi le programme de villa resté derrière.
  [ "$code" = "124" ] && pkill -f "vesuvius.ink_detection.inference.infer" && echo "limite de $LIMITE s dépassée : arrêté"
  local blocs; blocs=$(grep -o 'Selected [0-9]* patches' "$journal" | tail -1 | grep -o '[0-9]*')
  printf '%s\t%s\t%s\t%.1f\t%s\t%s\n' "$nom" "$taille" "${blocs:-0}" "$(awk "BEGIN { print $fin - $debut }")" "$(cat "$vram")" "$code" >> "$MESURES"
  echo "[$(date +%H:%M:%S)] $nom, $taille zone : $(tail -1 "$MESURES")"
}

K=0
for reglage in "lot4-compile:--batch-size 4" "lot4-sans-compilation:--batch-size 4 --no-compile" \
  "lot8-sans-compilation:--batch-size 8 --no-compile" \
  "lot8-fils-et-cache:--batch-size 8 --no-compile --loader-threads 8 --chunk-cache-size 64"; do
  nom="${reglage%%:*}"; read -r -a options <<< "${reglage#*:}"
  for taille in petite grande; do K=$((K + 1)); mesurer "$K" "$nom" "$taille" "${options[@]}"; done
done

etape 9 "les images sont-elles les mêmes d'un réglage à l'autre ?"
for nom in lot4-sans-compilation lot8-sans-compilation lot8-fils-et-cache; do
  echo "--- lot4-compile contre $nom (grande zone)"
  [ -f "$SORTIE/$nom-grande/assemblee.tif" ] && [ -f "$SORTIE/lot4-compile-grande/assemblee.tif" ] \
    && uv run --no-project --with numpy --with tifffile --with imagecodecs python "$OUTILS/bandes.py" comparer \
      "$SORTIE/lot4-compile-grande/assemblee.tif" "$SORTIE/$nom-grande/assemblee.tif" || echo "comparaison impossible"
done

etape 10 "le tableau"
python3 "$ICI/tableau.py" "$MESURES"
echo "[$(date +%H:%M:%S)] ===== fin de l'essai ====="
