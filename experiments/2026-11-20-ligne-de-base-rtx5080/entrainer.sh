#!/usr/bin/env bash
# X-015 : refaire l'entraînement de X-002 à l'identique sur la nouvelle machine (RTX 5080, 16 Go).
# À lancer depuis Ubuntu : bash experiments/2026-11-20-ligne-de-base-rtx5080/entrainer.sh
# Après un arrêt, relancer la même commande : l'entraînement repart de son dernier point de sauvegarde.
# Le programme lancé n'est pas le nôtre : c'est celui de ScrollPrize/villa (licence MIT), https://github.com/ScrollPrize/villa
set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"
ICI="$(dirname "$(realpath "$0")")"
cd "$HOME/vesuvius/villa/vesuvius"
bash "$ICI/../../scripts/wsl/lancer-execution.sh" X-015 "$ICI" bash "$ICI/etapes.sh"
