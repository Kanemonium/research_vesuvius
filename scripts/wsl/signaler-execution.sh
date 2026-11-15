#!/usr/bin/env bash
# Met en pause ou relance une exécution lancée par lancer-execution.sh. C'est ce qu'appellent les
# boutons « Pause » et « Reprendre » de l'IHM.
# La pause gèle le programme tel quel (signal STOP) : rien n'est perdu et la reprise est immédiate.
# La carte graphique ne calcule plus, mais sa mémoire reste occupée. Une pause ne survit pas à un
# redémarrage de la machine ou d'Ubuntu : dans ce cas, relancer la commande (elle reprend où elle en était).
# Usage : bash signaler-execution.sh <X-…> <dossier de l'expérience> pause|reprendre
set -uo pipefail
ID="${1:?identifiant manquant}"
ETAT="$(realpath "${2:?dossier manquant}")/journaux/$ID.etat.json"
ACTION="${3:?action manquante}"
[[ "$ID" =~ ^X-[0-9]{3}$ ]] || { echo "identifiant invalide" >&2; exit 2; }
[ -s "$ETAT" ] || { echo "cette exécution n'a pas été lancée" >&2; exit 3; }
PID="$(sed -n 's/.*"pid": \([0-9][0-9]*\).*/\1/p' "$ETAT" | head -1)"
[ -n "$PID" ] && kill -0 "$PID" 2>/dev/null || { echo "le programme ne tourne pas (ou pas dans cet Ubuntu)" >&2; exit 3; }

# Le signal part vers tout le groupe du programme ; à défaut de groupe, vers le programme seul.
signaler() { kill "-$1" -- "-$PID" 2>/dev/null || kill "-$1" "$PID"; }
case "$ACTION" in
  pause)
    signaler STOP || exit 4
    sed -i "s/\"pause\": [^,]*,/\"pause\": \"$(date +%Y-%m-%dT%H:%M:%S%:z)\",/" "$ETAT"
    echo "en pause" ;;
  reprendre)
    signaler CONT || exit 4
    sed -i 's/"pause": [^,]*,/"pause": null,/' "$ETAT"
    echo "reprise" ;;
  *) echo "action inconnue : $ACTION" >&2; exit 2 ;;
esac
