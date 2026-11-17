---
id: T-019
titre: "Essayer les blocs de 256 en lot de 1"
statut: faite
piste: P-310
priorite: 1
responsable: "Agent C."
echeance: null
issue: null
creee: 2026-11-17
etapes:
  - date: 2026-11-17
    genre: etape
    statut: faite
    titre: "Écrire la page de l'essai (X-010)"
    detail: "350 itérations, lot de 1, deux lots cumulés, mesure intégrée de villa, ni notation ni point de sauvegarde. Limite de quarante minutes si la mémoire déborde."
  - date: 2026-11-17
    genre: etape
    statut: faite
    titre: "Lancer l'essai et relever vitesse et mémoire"
    detail: "Accord de Kanemonium le 2026-11-17. Mémoire vidéo pleine (7 993 Mo), 125 itérations sur 350 en 40 min 54 s, arrêt par la limite : 19,6 s par itération en moyenne, contre 0,39 s en blocs de 128."
  - date: 2026-11-17
    genre: bug
    statut: ouvert
    titre: "La mesure intégrée de villa ne rend rien si l'essai est arrêté"
    detail: "Elle n'écrit son résumé qu'à la fin des itérations demandées. Pour un essai qui risque de déborder, demander moins d'itérations ou lire la barre de progression."
  - date: 2026-11-17
    genre: etape
    statut: faite
    titre: "Décider d'un entraînement complet"
    detail: "Écarté avec ce réglage : la carte ne tient pas, 20 000 itérations prendraient environ 109 h (calculé). Prévu au départ : seulement si la carte tient. Il écrirait environ 16 Go de points de sauvegarde alors qu'il reste 19 Go libres : la place est à régler d'abord. À juger contre le F1 de 0,776 de X-009, sur les mêmes régions."
---

Fait quand nous savons si notre carte tient des blocs de 256 en lot de 1, à quelle vitesse, et si un entraînement complet est lancé ou écarté. Troisième point de l'ordre d'essai de `docs/veille-optimisations.md`.

Fait le 2026-11-17 (X-010) : la carte ne tient pas, l'entraînement complet est écarté avec ce réglage. Restent non essayés : une taille de 192, la machine avec le reste fermé, le recalcul des étapes intermédiaires (sixième point de l'ordre d'essai).
