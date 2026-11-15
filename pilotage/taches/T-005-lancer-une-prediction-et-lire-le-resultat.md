---
id: T-005
titre: "Lancer une prédiction et lire le résultat"
statut: en-cours
piste: P-310
priorite: 2
responsable: "Kanemonium + Agent C."
echeance: null
issue: null
creee: 2026-11-14
etapes:
  - date: 2026-11-15
    genre: etape
    statut: faite
    titre: Écrire la page de l'exécution avant de lancer
    detail: "X-003 : ce qu'elle doit produire, la commande annotée, ce qu'elle ne dira pas."
  - date: 2026-11-15
    genre: etape
    statut: faite
    titre: Choisir le point de sauvegarde
    detail: "`ckpt_020000.pth`, le dernier écrit par X-002."
  - date: 2026-11-15
    genre: etape
    statut: faite
    titre: Lancer la prédiction sur le segment
    detail: "X-003 : 16 bandes, 5 h 34 min, 346 481 blocs, aucune reprise. Pic de mémoire vidéo : 4 870 Mo."
  - date: 2026-11-15
    genre: etape
    statut: en-cours
    titre: Regarder l'image ensemble
    detail: "Agent C. a regardé un aperçu réduit seize fois : des formes claires alignées en rangées dans la moitié haute. Kanemonium ne l'a pas encore vue. C'est le segment d'entraînement : un premier aperçu, pas une preuve."
  - date: 2026-11-15
    genre: etape
    statut: a-faire
    titre: Comparer l'image aux étiquettes
    detail: "Superposer l'image d'encre aux étiquettes et au masque de supervision du segment : les formes visibles sont-elles toutes dans les zones étiquetées ? Sans cela, on ne sait pas si le modèle a appris ou récité."
---

Fait quand une image de prédiction d'encre est produite et regardée ensemble.
