#!/usr/bin/env bash
# Essai X-004 : la pause et la reprise fonctionnent-elles pour de bon, sur une petite zone du segment ?
# À lancer depuis Ubuntu : bash experiments/2026-11-15-pause-et-reprise/essai.sh
# Après un arrêt, relancer la même commande : l'essai reprend où il en était.
set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"
ICI="$(dirname "$(realpath "$0")")"
bash "$ICI/../../scripts/wsl/ajouter-echange.sh" >/dev/null
cd "$HOME/vesuvius/villa/vesuvius"
bash "$ICI/../../scripts/wsl/lancer-execution.sh" X-004 "$ICI" bash "$ICI/etapes.sh"
