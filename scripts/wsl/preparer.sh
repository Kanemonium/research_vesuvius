#!/usr/bin/env bash
# Prépare Ubuntu pour le travail de recherche. À lancer en root, une fois.
set -euo pipefail
UTILISATEUR=kanemonium

# 1. Un utilisateur ordinaire, pour ne pas tout faire en root. Pas de mot de passe : sudo sans saisie.
if ! id "$UTILISATEUR" >/dev/null 2>&1; then
  useradd --create-home --shell /bin/bash "$UTILISATEUR"
  echo "$UTILISATEUR ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/90-$UTILISATEUR
  chmod 440 /etc/sudoers.d/90-$UTILISATEUR
fi
printf '[user]\ndefault=%s\n\n[boot]\nsystemd=true\n' "$UTILISATEUR" > /etc/wsl.conf

# 2. Outils de base (compilateur compris : certaines dépendances Python en ont besoin).
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq build-essential git curl ca-certificates unzip >/dev/null
echo "paquets installés"

# 3. uv, le gestionnaire d'environnements Python utilisé par le tutoriel, pour cet utilisateur.
sudo -u "$UTILISATEUR" bash -lc 'command -v uv >/dev/null 2>&1 || curl -LsSf https://astral.sh/uv/install.sh | sh >/dev/null 2>&1; ~/.local/bin/uv --version'
gcc --version | head -1
echo "prêt"
