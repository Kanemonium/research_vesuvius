#!/usr/bin/env bash
# État d'Ubuntu sous WSL : système, carte graphique, ressources, outils.
grep PRETTY_NAME /etc/os-release
uname -r
echo "--- carte graphique"
nvidia-smi --query-gpu=name,memory.total,memory.used,driver_version --format=csv,noheader 2>&1 | head -3
echo "--- ressources (coeurs, mémoire en Go, disque)"
nproc
free -g | sed -n 2p
df -h / | tail -1
echo "--- outils"
for t in git curl python3 gcc uv; do
  if command -v "$t" >/dev/null 2>&1; then echo "$t: présent"; else echo "$t: absent"; fi
done
echo "--- utilisateur"
id -un
