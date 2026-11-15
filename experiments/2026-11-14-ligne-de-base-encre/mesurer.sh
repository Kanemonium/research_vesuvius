#!/usr/bin/env bash
# Lance un entraînement avec la configuration donnée et relève le pic de mémoire vidéo et la durée. Le programme lancé n'est pas le nôtre : c'est celui de ScrollPrize/villa (licence MIT), https://github.com/ScrollPrize/villa
# Usage : bash mesurer.sh <config.json>
set -uo pipefail
export PATH="$HOME/.local/bin:$PATH"
CONFIG="$(realpath "$1")"
# Sans mémoire d'appoint, le chargement des étiquettes dépasse la mémoire vive et le système tue le programme.
bash "$(dirname "$(realpath "$0")")/../../scripts/wsl/ajouter-echange.sh" >/dev/null
NOM="$(basename "$CONFIG" .json)"
cd "$HOME/vesuvius/villa/vesuvius"
mkdir -p configs runs
cp "$CONFIG" "configs/$NOM.json"
JOURNAL="runs/$NOM.log"

( PIC=0; while true; do
    M=$(nvidia-smi --query-gpu=memory.used --format=csv,noheader,nounits 2>/dev/null | head -1)
    [ -n "$M" ] && [ "$M" -gt "$PIC" ] && PIC=$M && echo "$PIC" > "runs/$NOM.vram"
    sleep 2
  done ) &
SONDE=$!
AVANT=$(nvidia-smi --query-gpu=memory.used --format=csv,noheader,nounits | head -1)
DEBUT=$(date +%s)
uv run --extra models python -m vesuvius.ink_detection.training.train "configs/$NOM.json" > "$JOURNAL" 2>&1
CODE=$?
FIN_=$(date +%s)
kill $SONDE 2>/dev/null

echo "code de sortie : $CODE"
echo "durée totale : $((FIN_ - DEBUT)) s"
echo "mémoire vidéo avant : $AVANT Mo ; pic pendant : $(cat "runs/$NOM.vram" 2>/dev/null) Mo sur 8192"
echo "mémoire vive : $(free -m | awk '/Mem/ {print $3 " Mo utilisés sur " $2}')"
echo "--- fin du journal"
tr '\r' '\n' < "$JOURNAL" | grep -v "^\s*$" | tail -25 | cut -c1-220
