#!/usr/bin/env bash
# Lance une exécution en la rendant suivable depuis l'IHM (onglet Exécutions) :
#   journaux/<id>.etat.json   début, puis fin, code de sortie et pic de mémoire vidéo
#   journaux/<id>.brut.log    tout ce que le programme affiche, au fil de l'eau (jamais versionné)
#   journaux/<id>.log         le journal condensé, écrit à la fin : c'est lui qu'on garde dans le dépôt
# La page de l'exécution (execution.yaml) s'écrit AVANT de lancer, avec ce qu'on sait déjà.
#
# Pause : signaler-execution.sh gèle puis relance le programme sans rien perdre (boutons de l'IHM).
# Reprise : relancer la même commande après un arrêt (Ctrl+C, redémarrage, échec). Le lanceur le
#   reconnaît, garde l'heure du premier début et écrit à la suite du même journal. C'est à la commande
#   de sauter ce qui est déjà fait (voir predire-par-bandes.sh et reprendre-entrainement.sh).
# Étapes : une commande en plusieurs étapes écrit « k n libellé » dans le fichier $EXECUTION_ETAPE ;
#   l'IHM affiche alors « libellé k/n » et l'avancement de l'ensemble.
#
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
export EXECUTION_ETAPE="$JOURNAUX/$ID.etape"
maintenant() { date +%Y-%m-%dT%H:%M:%S%:z; }
champ() { sed -n "s/.*\"$1\": \"\{0,1\}\([^\",]*\)\"\{0,1\},\{0,1\}\$/\1/p" "$ETAT" 2>/dev/null | head -1; }
# Le fichier d'état est versionné dans un dépôt public : pas de nom de compte Windows dans la commande.
COMMANDE="$(printf '%s ' "$@" | sed -E -e 's#/mnt/[a-z]/Users/[^/ "]+#<windows>#g' -e 's#[A-Za-z]:[/\\]+Users[/\\]+[^/\\ "]+#<windows>#g' \
  | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e 's/ $//')"

# Reprise : une exécution déjà commencée et pas terminée avec succès continue dans le même journal.
DEBUT="$(maintenant)"
REPRISES=0
if [ -s "$ETAT" ] && [ -f "$BRUT" ] && [ "$(champ code)" != "0" ]; then
  DEBUT="$(champ debut)"
  REPRISES=$(( $(champ reprises || echo 0) + 1 ))
  PIC_AVANT="$(champ pic_vram_mo)"
  printf '\n===== reprise nº %s le %s =====\n' "$REPRISES" "$(maintenant)" >> "$BRUT"
else
  rm -f "$EXECUTION_ETAPE"
  : > "$BRUT"
fi
rm -f "$VRAM" "$JOURNAUX/$ID.log"
[[ "${PIC_AVANT:-}" =~ ^[0-9]+$ ]] && echo "$PIC_AVANT" > "$VRAM"

# $1 : fin (entre guillemets) ou null ; $2 : code de sortie ou null ; $3 : numéro du processus ou null
ecrire_etat() {
  local pic="null"
  [ -s "$VRAM" ] && pic="$(cat "$VRAM")"
  printf '{\n  "id": "%s",\n  "debut": "%s",\n  "fin": %s,\n  "code": %s,\n  "pid": %s,\n  "pause": null,\n  "reprises": %s,\n  "pic_vram_mo": %s,\n  "commande": "%s"\n}\n' \
    "$ID" "$DEBUT" "$1" "$2" "$3" "$REPRISES" "$pic" "$COMMANDE" > "$ETAT"
}

# Sonde : toutes les deux secondes, ne garde que le maximum de mémoire vidéo utilisée.
SONDE=""
if command -v nvidia-smi >/dev/null 2>&1; then
  ( PIC="$(cat "$VRAM" 2>/dev/null || echo 0)"; while true; do
      M=$(nvidia-smi --query-gpu=memory.used --format=csv,noheader,nounits 2>/dev/null | head -1)
      [ -n "$M" ] && [ "$M" -gt "$PIC" ] && PIC=$M && echo "$PIC" > "$VRAM"
      sleep 2
    done ) &
  SONDE=$!
fi

clore() {
  [ -n "$SONDE" ] && kill "$SONDE" 2>/dev/null
  bash "$ICI/condenser-journal.sh" "$BRUT" "$JOURNAUX/$ID.log"
  ecrire_etat "\"$(maintenant)\"" "$1" null
  rm -f "$VRAM"
  [ "$1" = "0" ] && rm -f "$EXECUTION_ETAPE"
}

# Le programme tourne dans son propre groupe de processus : une pause ou un arrêt atteint ainsi
# tout ce qu'il a lancé (uv, python, ses processus de chargement), et rien d'autre.
export PYTHONUNBUFFERED=1
if command -v setsid >/dev/null 2>&1; then
  setsid "$@" >> "$BRUT" 2>&1 &
else
  "$@" >> "$BRUT" 2>&1 &
fi
PID=$!
ecrire_etat null null "$PID"
arreter() {
  kill -CONT -- "-$PID" 2>/dev/null; kill -TERM -- "-$PID" 2>/dev/null || kill -TERM "$PID" 2>/dev/null
  wait "$PID" 2>/dev/null
  printf '\n===== arrêt demandé le %s =====\n' "$(maintenant)" >> "$BRUT"
  clore 130
  exit 130
}
trap arreter INT TERM
wait "$PID"
CODE=$?
trap - INT TERM
clore "$CODE"

echo "exécution $ID : code de sortie $CODE"
echo "journal condensé : $JOURNAUX/$ID.log"
exit "$CODE"
