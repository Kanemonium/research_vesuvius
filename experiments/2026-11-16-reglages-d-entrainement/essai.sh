#!/usr/bin/env bash
# Essai X-007 : plus de processus de chargement accélèrent-ils notre entraînement ?
# À lancer depuis Ubuntu : bash experiments/2026-11-16-reglages-d-entrainement/essai.sh
# Après un arrêt, relancer la même commande : les mesures déjà faites sont sautées.
set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"
ICI="$(dirname "$(realpath "$0")")"
# Sans mémoire d'appoint, le chargement des étiquettes dépasse la mémoire vive et le système tue le programme.
bash "$ICI/../../scripts/wsl/ajouter-echange.sh" >/dev/null
cd "$HOME/vesuvius/villa/vesuvius"
bash "$ICI/../../scripts/wsl/lancer-execution.sh" X-007 "$ICI" bash "$ICI/etapes.sh"
