#!/usr/bin/env bash
# X-009 : noter chaque point de sauvegarde de X-008 sur les régions mises de côté, entières.
# À lancer depuis Ubuntu : bash experiments/2026-11-17-noter-les-points-de-sauvegarde/essai.sh
# Après un arrêt, relancer la même commande : les prédictions déjà écrites sont gardées.
set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"
ICI="$(dirname "$(realpath "$0")")"
bash "$ICI/../../scripts/wsl/ajouter-echange.sh" >/dev/null
cd "$HOME/vesuvius/villa/vesuvius"
bash "$ICI/../../scripts/wsl/lancer-execution.sh" X-009 "$ICI" bash "$ICI/etapes.sh"
