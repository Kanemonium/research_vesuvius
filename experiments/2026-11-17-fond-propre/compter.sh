#!/usr/bin/env bash
# X-013 : compter les blocs que villa tirerait si les blocs sans encre étaient admis. Rien n'est entraîné.
# À lancer depuis Ubuntu : bash experiments/2026-11-17-fond-propre/compter.sh
# Relancer refait le compte ; la liste de blocs déjà écrite par villa est relue.
set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"
ICI="$(dirname "$(realpath "$0")")"
bash "$ICI/../../scripts/wsl/ajouter-echange.sh" >/dev/null
cd "$HOME/vesuvius/villa/vesuvius"
bash "$ICI/../../scripts/wsl/lancer-execution.sh" X-013 "$ICI" bash "$ICI/etapes-compter.sh"
