#!/usr/bin/env bash
# X-011 : proposer des carrés de papyrus loin de toute annotation, à faire juger par Kanemonium.
# À lancer depuis Ubuntu : bash experiments/2026-11-17-fond-propre/essai.sh
# Rien n'est entraîné ni prédit : le script relit la carte d'encre de X-003. Relancer refait tout, en une minute ou deux.
set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"
ICI="$(dirname "$(realpath "$0")")"
cd "$HOME/vesuvius/villa/vesuvius"
bash "$ICI/../../scripts/wsl/lancer-execution.sh" X-011 "$ICI" bash "$ICI/etapes.sh"
