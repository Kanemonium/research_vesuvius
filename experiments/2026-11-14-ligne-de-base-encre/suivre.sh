#!/usr/bin/env bash
# Montre où en est un entraînement : dernière ligne de progression, mémoire vidéo, points de sauvegarde.
# Usage : bash suivre.sh <nom de la configuration, sans .json> [attendre]
NOM="${1:-ligne-de-base-128}"
RUNS="$HOME/vesuvius/villa/vesuvius/runs"
JOURNAL="$RUNS/$NOM.log"
if [ "${2:-}" = "attendre" ]; then
  for i in $(seq 1 90); do grep -q "it/s\|s/it" "$JOURNAL" 2>/dev/null && break; sleep 4; done
  sleep 20
fi
echo "progression : $(tr '\r' '\n' < "$JOURNAL" | grep -E "it/s|s/it" | tail -1 | cut -c1-120)"
echo "erreurs dans le journal : $(grep -ciE "error|traceback|out of memory" "$JOURNAL")"
echo "carte : $(nvidia-smi --query-gpu=memory.used,utilization.gpu,temperature.gpu --format=csv,noheader)"
echo "mémoire vive : $(free -m | awk '/Mem/ {print $3 " Mo utilisés"} /Swap/ {print ", échange " $3 " Mo"}' | tr -d '\n')"
SORTIE="$RUNS/$(echo "$NOM" | tr '-' '_')"
echo "sauvegardes : $(ls "$SORTIE" 2>/dev/null | grep -c '^ckpt_') ; aperçus : $(ls "$SORTIE/train_previews" 2>/dev/null | wc -l)"
