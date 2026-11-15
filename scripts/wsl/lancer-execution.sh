#!/usr/bin/env bash
# Lance une exécution en la rendant suivable depuis l'IHM (onglet Exécutions) :
#   journaux/<id>.etat.json   début, puis fin, code de sortie et pic de mémoire vidéo
#   journaux/<id>.brut.log    tout ce que le programme affiche, au fil de l'eau (jamais versionné)
#   journaux/<id>.log         le journal condensé, écrit à la fin : c'est lui qu'on garde dans le dépôt
# La page de l'exécution (execution.yaml) s'écrit AVANT de lancer, avec ce qu'on sait déjà.
# Usage : bash lancer-execution.sh <X-…> <dossier de l'expérience> <commande et ses arguments…>
set -uo pipefail
ID="${1:?identifiant X-… manquant}"
DOSSIER="$(realpath "${2:?dossier de l expérience manquant}")"
shift 2
[[ "$ID" =~ ^X-[0-9]{3}$ ]] || { echo "identifiant invalide : $ID" >&2; exit 2; }
[ "$#" -gt 0 ] || { echo "aucune commande à lancer" >&2; exit 2; }

ICI="$(dirname "$(realpath "$0")")"
JOURNAUX="$DOSSIER/journaux"
mkdir -p "$JOURNAUX"
ETAT="$JOURNAUX/$ID.etat.json"
BRUT="$JOURNAUX/$ID.brut.log"
VRAM="$JOURNAUX/$ID.vram"
maintenant() { date +%Y-%m-%dT%H:%M:%S%:z; }
DEBUT="$(maintenant)"
# Le fichier d'état est versionné dans un dépôt public : pas de nom de compte Windows dans la commande.
COMMANDE="$(printf '%s ' "$@" | sed -E -e 's#/mnt/[a-z]/Users/[^/ "]+#<windows>#g' -e 's#[A-Za-z]:[/\\]+Users[/\\]+[^/\\ "]+#<windows>#g' \
  | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e 's/ $//')"

# $1 : fin (entre guillemets) ou null ; $2 : code de sortie ou null
ecrire_etat() {
  local pic="null"
  [ -s "$VRAM" ] && pic="$(cat "$VRAM")"
  printf '{\n  "id": "%s",\n  "debut": "%s",\n  "fin": %s,\n  "code": %s,\n  "pic_vram_mo": %s,\n  "commande": "%s"\n}\n' \
    "$ID" "$DEBUT" "$1" "$2" "$pic" "$COMMANDE" > "$ETAT"
}

rm -f "$VRAM" "$JOURNAUX/$ID.log"
: > "$BRUT"
ecrire_etat null null

# Sonde : toutes les deux secondes, ne garde que le maximum de mémoire vidéo utilisée.
SONDE=""
if command -v nvidia-smi >/dev/null 2>&1; then
  ( PIC=0; while true; do
      M=$(nvidia-smi --query-gpu=memory.used --format=csv,noheader,nounits 2>/dev/null | head -1)
      [ -n "$M" ] && [ "$M" -gt "$PIC" ] && PIC=$M && echo "$PIC" > "$VRAM"
      sleep 2
    done ) &
  SONDE=$!
fi

clore() {
  [ -n "$SONDE" ] && kill "$SONDE" 2>/dev/null
  bash "$ICI/condenser-journal.sh" "$BRUT" "$JOURNAUX/$ID.log"
  ecrire_etat "\"$(maintenant)\"" "$1"
  rm -f "$VRAM"
}
trap 'clore 130; exit 130' INT TERM

export PYTHONUNBUFFERED=1
"$@" > "$BRUT" 2>&1
CODE=$?
trap - INT TERM
clore "$CODE"

echo "exécution $ID : code de sortie $CODE"
echo "journal condensé : $JOURNAUX/$ID.log"
exit "$CODE"
