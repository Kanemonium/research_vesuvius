#!/usr/bin/env bash
# Essai X-006 : la seconde passe de X-005, mêmes réglages, mêmes zones, une fois le volume déjà lu.
# À lancer depuis Ubuntu : bash experiments/2026-11-16-reglages-de-prediction/controle.sh
# Après un arrêt, relancer la même commande : les mesures déjà faites sont sautées.
# Le programme lancé n'est pas le nôtre : c'est celui de ScrollPrize/villa (licence MIT), https://github.com/ScrollPrize/villa
set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"
ICI="$(dirname "$(realpath "$0")")"
bash "$ICI/../../scripts/wsl/ajouter-echange.sh" >/dev/null
cd "$HOME/vesuvius/villa/vesuvius"
if [ "${1:-}" != "etapes" ]; then
  exec bash "$ICI/../../scripts/wsl/lancer-execution.sh" X-006 "$ICI" bash "$ICI/controle.sh" etapes
fi
SUFFIXE="-passe2" bash "$ICI/etapes.sh"
# Le même réglage, deux fois : ce que deux passes identiques donnent comme écart, pour lire les autres.
SORTIE="predictions/essai-reglages"
echo "--- lot4-compile, première passe contre seconde passe (grande zone)"
uv run --no-project --with numpy --with tifffile --with imagecodecs python "$ICI/../../scripts/wsl/bandes.py" comparer \
  "$SORTIE/lot4-compile-grande/assemblee.tif" "$SORTIE/lot4-compile-passe2-grande/assemblee.tif"
