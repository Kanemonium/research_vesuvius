#!/usr/bin/env bash
# Les étapes de l'essai X-007 : le même court entraînement avec 1, 2 puis 4 processus de chargement,
# puis de nouveau 1, pour voir de combien une mesure bouge. Appelé par essai.sh, depuis villa/vesuvius.
# Une mesure déjà faite est sautée : relancer reprend.
# Le programme lancé et sa mesure intégrée (« benchmark ») ne sont pas les nôtres : ce sont ceux de
# ScrollPrize/villa (licence MIT), https://github.com/ScrollPrize/villa
set -uo pipefail
ICI="$(dirname "$(realpath "$0")")"
MODELE="$ICI/essai-chargement.json"
LIMITE=1500
VARIANTES=("un:1" "deux:2" "quatre:4" "un-bis:1")
TOTAL=$(( ${#VARIANTES[@]} + 1 ))
mkdir -p configs runs
etape() { echo "$1 $TOTAL étape" > "$EXECUTION_ETAPE"; echo "[$(date +%H:%M:%S)] ===== étape $1/$TOTAL : $2 ====="; }

K=0
for variante in "${VARIANTES[@]}"; do
  K=$((K + 1)); nom="${variante%%:*}"; processus="${variante#*:}"
  dossier="runs/essai_chargement_$nom"; config="configs/essai-chargement-$nom.json"
  etape "$K" "$processus processus de chargement ($nom)"
  if [ -s "$dossier/benchmark_summary.json" ]; then echo "déjà mesuré, sauté"; continue; fi
  rm -rf "$dossier"; mkdir -p "$dossier"
  # La liste des blocs étiquetés a déjà été calculée par X-002 : la reprendre évite de la refaire.
  cp -n runs/ligne_de_base_128/flat_ink_patches_*.json "$dossier/" 2>/dev/null || true
  sed -e "s#\"out_dir\": \"[^\"]*\"#\"out_dir\": \"$dossier\"#" \
      -e "s#\"dataloader_workers\": [0-9]*#\"dataloader_workers\": $processus#" "$MODELE" > "$config"
  debut=$(date +%s)
  timeout "$LIMITE" uv run --extra models python -m vesuvius.ink_detection.training.train "$config"
  code=$?
  [ "$code" = "124" ] && pkill -f "vesuvius.ink_detection.training.train" && echo "limite de $LIMITE s dépassée : arrêté"
  echo "[$(date +%H:%M:%S)] $nom : code $code, $(( $(date +%s) - debut )) s en tout ; mémoire vive : $(free -m | awk '/Mem/ {print $3 " Mo utilisés"} /Swap|Échange/ {print ", échange " $3 " Mo"}' | tr -d '\n')"
done

etape "$TOTAL" "le tableau"
python3 "$ICI/resume.py" runs "${VARIANTES[@]}"
echo "[$(date +%H:%M:%S)] ===== fin de l'essai ====="
