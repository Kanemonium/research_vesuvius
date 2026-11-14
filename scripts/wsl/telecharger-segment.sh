#!/usr/bin/env bash
# Télécharge le segment du tutoriel d'encre (PHerc. Paris. 4, environ 25 Go d'après le tutoriel).
# Reprise possible : relancer la commande ne retransfère que ce qui manque.
set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"
SEGMENT="${1:-w00_20231016151002}"
CIBLE="$HOME/vesuvius/ink-dataset/phercparis4/$SEGMENT"
mkdir -p "$CIBLE"

uvx --from huggingface_hub hf buckets sync \
  "hf://buckets/scrollprize/datasets/ink/phercparis4/$SEGMENT" \
  "$CIBLE"

echo "--- reçu"
du -sh "$CIBLE"
ls "$CIBLE"
df -h / | tail -1
