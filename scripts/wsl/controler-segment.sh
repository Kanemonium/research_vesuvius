#!/usr/bin/env bash
# Contrôle le segment téléchargé : taille, fichiers attendus par la chaîne d'entraînement, mémoire et disque.
SEGMENT="${1:-w00_20231016151002}"
D="$HOME/vesuvius/ink-dataset/phercparis4/$SEGMENT"
if [ ! -d "$D" ]; then echo "segment absent : $D"; exit 1; fi

echo "taille totale : $(du -sh "$D" | cut -f1)"
ls -la "$D"
echo "--- contenu des volumes"
for z in "$D"/*.zarr; do
  echo "$(du -sh "$z" | cut -f1)  $(find "$z" -type f | wc -l) fichiers  $(basename "$z")"
done
echo "--- fichiers attendus"
for f in x.tif y.tif z.tif meta.json "$SEGMENT.zarr" "${SEGMENT}_inklabels.zarr" "${SEGMENT}_supervision_mask.zarr"; do
  if [ -e "$D/$f" ]; then echo "présent  $f"; else echo "MANQUANT $f"; fi
done
echo "--- meta.json"
head -c 600 "$D/meta.json" 2>/dev/null; echo
echo "--- mémoire et disque"
free -m | sed -n 1,3p
df -h / | tail -1
