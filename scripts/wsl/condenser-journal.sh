#!/usr/bin/env bash
# Condense un journal brut pour pouvoir le garder dans le dépôt : toutes les lignes ordinaires sont
# conservées, et des barres de progression on ne garde qu'une ligne par pour-cent franchi, plus la dernière.
# Un entraînement de 20 000 itérations passe ainsi d'environ 1,8 Mo à quelques dizaines de Ko.
# Usage : bash condenser-journal.sh <journal brut> <journal condensé>
set -euo pipefail
# Le dépôt est public : le nom du compte Windows est retiré des chemins avant d'écrire le journal.
tr '\r' '\n' < "$1" \
  | sed -E -e 's#/mnt/[a-z]/Users/[^/ "]+#<windows>#g' -e 's#[A-Za-z]:[/\\]+Users[/\\]+[^/\\ "]+#<windows>#g' \
  | awk '
  /[0-9]+%\|/ {
    match($0, /[0-9]+%/); p = substr($0, RSTART, RLENGTH - 1) + 0
    if (p != vu) { print; vu = p; attente = "" } else { attente = $0 }
    next
  }
  {
    if (attente != "") { print attente; attente = "" }
    vu = -1
    if ($0 !~ /^[[:space:]]*$/) print
  }
  END { if (attente != "") print attente }
' > "$2"
