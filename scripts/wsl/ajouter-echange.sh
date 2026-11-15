#!/usr/bin/env bash
# Ajoute un fichier d'échange dans Ubuntu : de la mémoire d'appoint sur disque, lente mais qui évite
# que le système tue l'entraînement quand la mémoire vive manque. Il est réactivé à chaque démarrage
# d'Ubuntu (ligne dans /etc/fstab). Réversible : voir la fin du fichier.
# Usage : bash ajouter-echange.sh [taille en Go, 12 par défaut]
set -euo pipefail
TAILLE="${1:-12}"
FICHIER=/swapfile-vesuvius

if ! swapon --show | grep -q "$FICHIER"; then
  if [ ! -f "$FICHIER" ]; then
    sudo fallocate -l "${TAILLE}G" "$FICHIER"
    sudo chmod 600 "$FICHIER"
    sudo mkswap "$FICHIER" >/dev/null
  fi
  sudo swapon "$FICHIER"
fi
grep -q "$FICHIER" /etc/fstab || echo "$FICHIER none swap sw 0 0" | sudo tee -a /etc/fstab >/dev/null
free -g | sed -n 1,3p

# Pour le retirer :
#   sudo swapoff /swapfile-vesuvius && sudo rm /swapfile-vesuvius && sudo sed -i '/swapfile-vesuvius/d' /etc/fstab
