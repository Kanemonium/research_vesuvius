#!/usr/bin/env bash
# Clone le dépôt du défi et installe la chaîne de détection d'encre (tutoriel /tutorial5).
# À lancer sous Ubuntu, avec l'utilisateur ordinaire.
set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"
BASE="$HOME/vesuvius"
mkdir -p "$BASE"
cd "$BASE"

if [ ! -d villa/.git ]; then
  git clone --depth 1 https://github.com/ScrollPrize/villa.git
fi
cd villa
echo "villa : commit $(git rev-parse --short HEAD) du $(git log -1 --format=%cs)"

# « uv sync » compile sur place deux composants C++ de villa (vc-object-store, volume-cartographer).
# Leurs bibliothèques système ne sont pas citées dans le tutoriel : on les installe avec le script
# officiel du dépôt, plus Boost complet que vc-object-store réclame.
bash volume-cartographer/scripts/install_build_deps.sh minimal-build >/dev/null
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq libboost-dev >/dev/null
echo "bibliothèques système installées"

# Délais larges : les roues CUDA de PyTorch pèsent plusieurs centaines de Mo chacune.
export UV_HTTP_TIMEOUT="${UV_HTTP_TIMEOUT:-900}"
export UV_CONCURRENT_DOWNLOADS="${UV_CONCURRENT_DOWNLOADS:-3}"

# La compilation lance par défaut une tâche par cœur. Avec peu de mémoire, elle la sature
# (27 compilateurs pour 6,8 Go lors du premier essai) : on compte environ 1,5 Go par tâche.
MEM_GO=$(awk '/MemTotal/ {printf "%d", $2/1024/1024}' /proc/meminfo)
TACHES=$(( MEM_GO * 2 / 3 )); [ "$TACHES" -lt 1 ] && TACHES=1
export CMAKE_BUILD_PARALLEL_LEVEL="${CMAKE_BUILD_PARALLEL_LEVEL:-$TACHES}"
export MAKEFLAGS="-j$CMAKE_BUILD_PARALLEL_LEVEL"
echo "compilation : $CMAKE_BUILD_PARALLEL_LEVEL tâches simultanées pour $MEM_GO Go de mémoire"

cd vesuvius
uv sync --extra models
uv run --extra models python -c "import torch; print('torch', torch.__version__, '| cuda :', torch.cuda.is_available(), '|', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'aucune carte')"

echo "--- tailles"
du -sh "$BASE/villa" "$BASE/villa/vesuvius/.venv" 2>/dev/null
df -h / | tail -1
