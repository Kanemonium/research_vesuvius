---
id: T-004
titre: "Entraîner le modèle du tutoriel et mesurer la mémoire vidéo"
statut: faite
piste: P-420
priorite: 2
responsable: "Agent C."
echeance: null
issue: null
creee: 2026-11-14
etapes:
  - date: 2026-11-14
    genre: bug
    statut: corrige
    titre: L'entraînement est tué au bout de 25 secondes
    detail: Le programme atteint 4,4 Go de mémoire vive en chargeant les étiquettes d'une image de 32 249 × 51 380 pixels, et Ubuntu n'en a que 6,8. Corrigé par 12 Go de fichier d'échange (`scripts/wsl/ajouter-echange.sh`).
  - date: 2026-11-14
    genre: bug
    statut: corrige
    titre: Le fichier d'échange disparaît au redémarrage
    detail: "Après un redémarrage de WSL, il n'était plus actif. Corrigé : il est inscrit dans `/etc/fstab`, et `mesurer.sh` le réactive avant chaque lancement."
  - date: 2026-11-14
    genre: etape
    statut: faite
    titre: Mesurer la recette du tutoriel sur 60 itérations
    detail: "Blocs de 256 : 7 996 Mo de mémoire vidéo, 21,7 secondes par itération. Voir X-001."
  - date: 2026-11-14
    genre: bug
    statut: contourne
    titre: La recette sature la carte
    detail: "Avec des blocs de 256, la mémoire vidéo est pleine et l'entraînement prendrait environ 120 heures. Contourné en passant à des blocs de 128, comme le tutoriel le suggère : 4 895 Mo, 3,03 itérations par seconde. L'effet sur la qualité est inconnu."
  - date: 2026-11-14
    genre: etape
    statut: faite
    titre: Lancer l'entraînement complet
    detail: 20 000 itérations en 1 h 53 min 51 s, pic de mémoire vidéo 4 959 Mo, aucune erreur. Voir X-002.
  - date: 2026-11-14
    genre: bug
    statut: ouvert
    titre: Aucune mesure de qualité à la fin
    detail: "Le segment du tutoriel n'a pas de zone de validation : villa saute alors la validation et n'écrit aucun aperçu. Le tutoriel le dit ; nous ne l'avions pas anticipé. Il faudra mettre une zone de côté pour comparer deux réglages."
  - date: 2026-11-14
    genre: etape
    statut: faite
    titre: Consigner le résultat
    detail: Compte rendu dans `experiments/2026-11-14-ligne-de-base-encre/`, rendus X-001 et X-002.
---

Noter le pic de mémoire vidéo, la durée par époque et les réglages modifiés. Résultat à consigner dans experiments/.

**2026-11-14** : mesures faites sur 60 itérations, voir `experiments/2026-11-14-ligne-de-base-encre/`. Recette du tutoriel (blocs de 256) : 7 996 Mo de mémoire vidéo, 21,7 s par itération. Blocs de 128 : 4 895 Mo, 3,03 itérations par seconde. Reste à lancer l'entraînement complet, sur décision de Kanemonium.

**2026-11-14, soir** : entraînement complet terminé avec des blocs de 128. 20 000 itérations en 1 h 53 min 51 s, pic de mémoire vidéo 4 959 Mo, aucune erreur. Perte d'entraînement moyenne : 0,514 sur les 1 000 premières itérations, 0,393 sur les 1 000 dernières. Qualité du modèle : non mesurée, la configuration du tutoriel ne réserve aucune zone de validation. Suite dans T-005.
