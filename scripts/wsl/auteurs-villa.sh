#!/usr/bin/env bash
# Qui a écrit ce fichier de villa, ou ces lignes ? Sert à citer la bonne personne (CLAUDE.md, « Citer le
# travail des autres »). N'affiche jamais d'adresse électronique.
#
# Notre installation de villa est une copie « superficielle » : elle ne contient que le dernier commit, et
# attribuerait donc tout à la dernière personne qui a commité. Ce script lit l'historique complet, gardé à
# part dans ~/vesuvius/villa-historique.git (commits et arborescences seulement, une dizaine de Mo).
#
# Usage : bash auteurs-villa.sh <fichier dans villa> [première ligne] [dernière ligne]
#   ex. : bash auteurs-villa.sh vesuvius/src/vesuvius/ink_detection/config.py 1022 1029
# Le commit étudié est celui de l'installation ; VILLA_COMMIT=<sha> en impose un autre.
# Pour passer du nom au compte GitHub : https://github.com/ScrollPrize/villa/commit/<sha>
set -euo pipefail
FICHIER="${1:?fichier manquant}"
H="$HOME/vesuvius/villa-historique.git"
COMMIT="${VILLA_COMMIT:-$(git -C "$HOME/vesuvius/villa" rev-parse HEAD)}"
if [ ! -d "$H" ]; then
  git clone --quiet --bare --filter=blob:none --single-branch --no-tags https://github.com/ScrollPrize/villa.git "$H"
fi
cd "$H"
git cat-file -e "$COMMIT" 2>/dev/null || git fetch --quiet --filter=blob:none origin
PLAGE=()
[ "$#" -ge 3 ] && PLAGE=(-L "$2,$3")

echo "villa au commit ${COMMIT:0:7} · $FICHIER${2:+ · lignes $2 à ${3:-$2}}"
echo
echo "Commits qui ont écrit ces lignes (lignes | commit | auteur | date | titre) :"
git blame -w -C "${PLAGE[@]}" --line-porcelain "$COMMIT" -- "$FICHIER" 2>/dev/null | awk '
  /^[0-9a-f]{40} / { sha = $1 }
  /^author / { sub(/^author /, ""); a = $0 }
  /^author-time / { t = $2 }
  /^summary / { sub(/^summary /, ""); s = $0 }
  /^\t/ { n[sha]++; qui[sha] = a; quand[sha] = t; quoi[sha] = s }
  END { for (k in n) printf "%5d | %s | %s | %s | %s\n", n[k], substr(k, 1, 10), qui[k], strftime("%Y-%m-%d", quand[k]), substr(quoi[k], 1, 80) }' | sort -rn | head -15
echo
echo "Lignes par personne :"
git blame -w -C "${PLAGE[@]}" --line-porcelain "$COMMIT" -- "$FICHIER" 2>/dev/null | grep '^author ' | sed 's/^author //' | sort | uniq -c | sort -rn | head -10
