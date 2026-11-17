#!/usr/bin/env bash
# Essai X-010 : notre carte de 8 Go tient-elle des blocs de 256 en lot de 1 ?
# À lancer depuis Ubuntu : bash experiments/2026-11-17-blocs-de-256/essai.sh
# Après un arrêt, relancer la même commande : une mesure déjà faite est sautée.
set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"
ICI="$(dirname "$(realpath "$0")")"
# Sans mémoire d'appoint, le chargement des étiquettes dépasse la mémoire vive et le système tue le programme.
bash "$ICI/../../scripts/wsl/ajouter-echange.sh" >/dev/null
cd "$HOME/vesuvius/villa/vesuvius"
bash "$ICI/../../scripts/wsl/lancer-execution.sh" X-010 "$ICI" bash "$ICI/etapes.sh"
