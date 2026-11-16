#!/usr/bin/env bash
# Essai X-005 : quels réglages de prédiction, déjà présents dans villa, vont plus vite sur notre carte ?
# À lancer depuis Ubuntu : bash experiments/2026-11-16-reglages-de-prediction/essai.sh
# Après un arrêt, relancer la même commande : les mesures déjà faites sont sautées.
set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"
ICI="$(dirname "$(realpath "$0")")"
bash "$ICI/../../scripts/wsl/ajouter-echange.sh" >/dev/null
cd "$HOME/vesuvius/villa/vesuvius"
bash "$ICI/../../scripts/wsl/lancer-execution.sh" X-005 "$ICI" bash "$ICI/etapes.sh"
