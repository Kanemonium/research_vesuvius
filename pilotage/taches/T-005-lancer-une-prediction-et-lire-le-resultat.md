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
    statut: faite
    titre: Comparer l'image aux étiquettes
    detail: "Fait avec `scripts/wsl/comparer_aux_etiquettes.py`. Des formes de lettres apparaissent aussi hors de la zone étiquetée (5,8 % de l'image) : le modèle ne fait pas que réciter. Mais il sépare mal l'encre du fond : médiane 201 sur l'encre étiquetée, 129 sur le fond étiqueté."
  - date: 2026-11-15
    genre: etape
    statut: a-faire
    titre: Comprendre pourquoi le fond reste gris
    detail: "Le tutoriel l'annonce en partie, pour ses modèles partagés : cibles adoucies à 0,25 et 0,75, donc un fond qui ne tombe pas à zéro. À vérifier : la valeur d'adoucissement de notre propre entraînement. L'encre à 201 sur 255 colle (0,79). Le fond à 129 (0,51 au lieu de 0,25) ne colle pas. Premier geste, prévu par le tutoriel : réétaler l'image pour l'affichage et regarder à nouveau."
---

Fait quand une image de prédiction d'encre est produite et regardée ensemble.
