#!/usr/bin/env bash
# Les deux étapes de X-015. Appelé par entrainer.sh, depuis villa/vesuvius. Relancer reprend.
# L'entraînement est celui de ScrollPrize/villa (licence MIT), https://github.com/ScrollPrize/villa
set -euo pipefail
ICI="$(dirname "$(realpath "$0")")"
OUTILS="$ICI/../../scripts/wsl"
REGLAGE="ligne-de-base-128-rtx5080.json"
SORTIE="runs/ligne_de_base_128_rtx5080"
etape() { echo "$1 2 étape" > "$EXECUTION_ETAPE"; echo "[$(date +%H:%M:%S)] ===== étape $1/2 : $2 ====="; }

etape 1 "la machine et le code"
nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader
nproc; free -m | sed -n 2,3p
git -C .. rev-parse --short HEAD
uv run --extra models python -c "import torch; print('torch', torch.__version__, torch.version.cuda)"
# Garde-fou : l'ancien modèle (X-002) ne doit pas être touché.
[ "$SORTIE" != "runs/ligne_de_base_128" ] || { echo "dossier de sortie de X-002 : refusé" >&2; exit 4; }

etape 2 "entraîner 20 000 itérations"
if ls "$SORTIE"/ckpt_*.pth >/dev/null 2>&1; then
  if [ -f "$SORTIE/ckpt_020000.pth" ]; then echo "entraînement déjà terminé, sauté"; else
    bash "$OUTILS/reprendre-entrainement.sh" "$ICI/$REGLAGE"
  fi
else
  mkdir -p "$SORTIE" configs
  cp "$ICI/$REGLAGE" "configs/$REGLAGE"
  uv run --extra models python -m vesuvius.ink_detection.training.train "configs/$REGLAGE"
fi
du -sh "$SORTIE"
df -h / | tail -1
echo "[$(date +%H:%M:%S)] ===== fin ====="
