#!/usr/bin/env bash
# Les deux étapes de X-010 : un court entraînement en blocs de 256 et lot de 1, puis ce qu'il a mesuré.
# Appelé par essai.sh, depuis villa/vesuvius. Une mesure déjà faite est sautée : relancer reprend.
# Le réglage (lot de 1, deux lots cumulés avant chaque correction) est celui que LynnHenry décrit dans
# la proposition https://github.com/ScrollPrize/villa/pull/2298 pour une RTX 3080 de 10 Go sous WSL2.
# Le programme lancé et sa mesure intégrée (« benchmark ») sont ceux de ScrollPrize/villa (licence MIT).
set -uo pipefail
ICI="$(dirname "$(realpath "$0")")"
DOSSIER="runs/essai_blocs_256"
CONFIG="configs/blocs-256.json"
LIMITE=2400
etape() { echo "$1 2 étape" > "$EXECUTION_ETAPE"; echo "[$(date +%H:%M:%S)] ===== étape $1/2 : $2 ====="; }

etape 1 "350 itérations en blocs de 256, lot de 1"
if [ -s "$DOSSIER/benchmark_summary.json" ]; then echo "déjà mesuré, sauté"; else
  rm -rf "$DOSSIER"; mkdir -p configs "$DOSSIER"
  cp "$ICI/blocs-256.json" "$CONFIG"
  echo "mémoire vidéo occupée avant de lancer : $(nvidia-smi --query-gpu=memory.used --format=csv,noheader)"
  debut=$(date +%s)
  # Si la mémoire vidéo déborde, le pilote ralentit tout au lieu d'arrêter : la limite coupe court.
  timeout "$LIMITE" uv run --extra models python -m vesuvius.ink_detection.training.train "$CONFIG"
  code=$?
  [ "$code" = "124" ] && pkill -f "vesuvius.ink_detection.training.train" && echo "limite de $LIMITE s dépassée : arrêté"
  echo "[$(date +%H:%M:%S)] code $code, $(( $(date +%s) - debut )) s en tout ; mémoire vive : $(free -m | awk '/Mem/ {print $3 " Mo utilisés"} /Swap|Échange/ {print ", échange " $3 " Mo"}' | tr -d '\n')"
fi

etape 2 "ce que villa a mesuré"
python3 - "$DOSSIER/benchmark_summary.json" <<'PY'
import json, os, sys
if not os.path.exists(sys.argv[1]):
    raise SystemExit("pas de mesure : l'entraînement n'est pas allé au bout")
m = json.load(open(sys.argv[1]))
pas = 1 / m["steps_per_second"]
print(f"{m['measured_steps']} itérations mesurées ; {pas:.3f} s par itération, "
      f"dont {m['data_wait_seconds_per_step']:.3f} s à attendre les données ; "
      f"pic alloué {m['peak_allocated_bytes'] / 2**20:.0f} Mo, réservé {m['peak_reserved_bytes'] / 2**20:.0f} Mo")
print(f"à ce rythme, 20 000 itérations : {20000 * pas / 3600:.1f} h (calculé, pas mesuré)")
PY
ls "$DOSSIER" | head -20
echo "[$(date +%H:%M:%S)] ===== fin de l'essai ====="
