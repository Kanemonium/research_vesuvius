#!/usr/bin/env bash
# Reprend un entraînement arrêté, à partir de son dernier point de sauvegarde.
# villa sait le faire : avec « checkpoint » dans le fichier de réglage, il recharge le modèle, l'état de
# l'optimiseur et le numéro du pas, puis continue. On perd au plus les itérations faites depuis la
# dernière sauvegarde (« save_every »).
# Le programme lancé n'est pas le nôtre : c'est celui de ScrollPrize/villa (licence MIT), https://github.com/ScrollPrize/villa
#
# Usage : bash reprendre-entrainement.sh <réglage.json> [point de sauvegarde]
#   Sans second argument, le plus récent ckpt_*.pth du dossier « out_dir » du réglage est pris.
# À lancer par lancer-execution.sh, avec le même identifiant X-… que l'entraînement interrompu.
set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"
CONFIG="$(realpath "${1:?fichier de réglage manquant}")"
NOM="$(basename "$CONFIG" .json)"
bash "$(dirname "$(realpath "$0")")/ajouter-echange.sh" >/dev/null
cd "$HOME/vesuvius/villa/vesuvius"
mkdir -p configs
SORTIE="$(python3 -c "import json,sys; print(json.load(open(sys.argv[1]))['out_dir'])" "$CONFIG")"
CKPT="${2:-$(ls -1 "$SORTIE"/ckpt_*.pth 2>/dev/null | sort | tail -1)}"
[ -n "$CKPT" ] && [ -f "$CKPT" ] || { echo "aucun point de sauvegarde dans $SORTIE : rien à reprendre" >&2; exit 3; }
# villa cherche ce chemin à partir du dossier du fichier de réglage : on lui donne donc le chemin complet.
CKPT="$(realpath "$CKPT")"
python3 - "$CONFIG" "$CKPT" "configs/$NOM-reprise.json" <<'PY'
import json, sys
reglage = json.load(open(sys.argv[1]))
reglage["checkpoint"] = sys.argv[2]
reglage["weights_only"] = False   # reprendre aussi l'optimiseur et le numéro du pas, pas seulement les poids
json.dump(reglage, open(sys.argv[3], "w"), indent=2)
PY
echo "[$(date +%H:%M:%S)] reprise depuis $CKPT (réglage : configs/$NOM-reprise.json)"
exec uv run --extra models python -m vesuvius.ink_detection.training.train "configs/$NOM-reprise.json"
