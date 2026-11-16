#!/usr/bin/env bash
# X-008 : réentraîner la ligne de base en mettant de côté des régions annotées, pour pouvoir la noter.
# À lancer depuis Ubuntu : bash experiments/2026-11-16-entrainement-avec-validation/essai.sh
# Après un arrêt, relancer la même commande : l'entraînement repart de son dernier point de sauvegarde.
set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"
ICI="$(dirname "$(realpath "$0")")"
# Sans mémoire d'appoint, le chargement des étiquettes dépasse la mémoire vive et le système tue le programme.
bash "$ICI/../../scripts/wsl/ajouter-echange.sh" >/dev/null
cd "$HOME/vesuvius/villa/vesuvius"
bash "$ICI/../../scripts/wsl/lancer-execution.sh" X-008 "$ICI" bash "$ICI/etapes.sh"
