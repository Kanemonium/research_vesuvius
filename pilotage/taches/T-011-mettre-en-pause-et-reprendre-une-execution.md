---
id: T-011
titre: "Mettre en pause et reprendre une exécution"
statut: faite
piste: P-420
priorite: 1
responsable: "Agent C."
echeance: null
issue: null
creee: 2026-11-15
etapes:
  - date: 2026-11-15
    genre: etape
    statut: faite
    titre: "Lire ce que villa sait déjà faire"
    detail: "L'entraînement reprend depuis un point de sauvegarde. La prédiction ne reprend pas, mais accepte un rectangle (`--roi`)."
  - date: 2026-11-15
    genre: etape
    statut: faite
    titre: "Pause et reprise depuis l'IHM"
    detail: "Boutons « Pause » et « Reprendre » dans la carte de l'exécution. Essai à blanc dans Ubuntu : le programme factice est resté figé dix secondes à 43/300, puis est reparti."
  - date: 2026-11-15
    genre: etape
    statut: faite
    titre: "Écrire le découpage en bandes et la reprise d'entraînement"
    detail: "`scripts/wsl/predire-par-bandes.sh`, `bandes.py`, `reprendre-entrainement.sh`. Le lanceur reconnaît une reprise et continue le même journal."
  - date: 2026-11-15
    genre: etape
    statut: faite
    titre: "Vérifier pour de bon sur une petite zone"
    detail: "X-004 : pause de 28 s sur le programme de villa, arrêt en pleine bande, reprise à la bande interrompue."
  - date: 2026-11-15
    genre: bug
    statut: corrige
    titre: "La reprise d'entraînement ne trouvait pas le point de sauvegarde"
    detail: "villa cherche ce chemin à partir du dossier du fichier de réglage, et `reprendre-entrainement.sh` lui donnait un chemin relatif. Corrigé en lui donnant le chemin complet ; la reprise a ensuite fonctionné, au pas 20 000."
  - date: 2026-11-15
    genre: bug
    statut: contourne
    titre: "Deux bandes ne donnent pas exactement la même image"
    detail: "0,9 % des pixels diffèrent d'un niveau sur 255, répartis partout, sans couture. Probablement des arrondis de calcul ; non vérifié. Accepté tel quel et écrit dans les limites de X-004."
  - date: 2026-11-15
    genre: bug
    statut: ouvert
    titre: "La prédiction n'affiche pas de barre de progression"
    detail: "Dans un journal, le programme de villa n'écrit aucune ligne d'avancement. L'IHM montre donc l'avancement bande par bande, pas en continu. La vitesse reste à mesurer sur une zone plus grande."
  - date: 2026-11-15
    genre: etape
    statut: faite
    titre: "Appliquer à la prédiction X-003"
    detail: "`predire.sh` passe par `predire-par-bandes.sh` : 16 bandes de 2 048 lignes."
---

Fait quand une exécution longue peut être gelée et relancée depuis l'IHM, et reprise après un arrêt sans tout refaire. Demande de Kanemonium du 2026-11-15, après l'estimation de 6 à 20 heures pour X-003.
