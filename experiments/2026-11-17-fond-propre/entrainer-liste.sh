#!/usr/bin/env bash
# X-014 : réentraîner sur les anciens blocs et ceux des carrés de fond, puis noter comme X-009.
# À lancer depuis Ubuntu : bash experiments/2026-11-17-fond-propre/entrainer-liste.sh
# Après un arrêt, relancer la même commande : chaque étape saute ce qui est déjà fait, et
# l'entraînement repart de son dernier point de sauvegarde.
set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"
ICI="$(dirname "$(realpath "$0")")"
# Sans mémoire d'appoint, le chargement des étiquettes dépasse la mémoire vive et le système tue le programme.
bash "$ICI/../../scripts/wsl/ajouter-echange.sh" >/dev/null
cd "$HOME/vesuvius/villa/vesuvius"
bash "$ICI/../../scripts/wsl/lancer-execution.sh" X-014 "$ICI" bash "$ICI/etapes-liste.sh"
