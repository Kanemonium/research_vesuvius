---
id: T-015
titre: "Mesurer les réglages gratuits relevés par la veille"
statut: faite
piste: P-420
priorite: 1
responsable: "Agent C."
echeance: null
issue: null
creee: 2026-11-16
etapes:
  - date: 2026-11-16
    genre: etape
    statut: faite
    titre: "Relever les options réelles du programme de prédiction"
    detail: "Dans notre installation de villa : `--batch-size` (1 par défaut), `--no-compile`, `--compile-mode` (`reduce-overhead` par défaut), `--loader-threads`, `--chunk-cache-size`, `--num-workers` (4 par défaut)."
  - date: 2026-11-16
    genre: etape
    statut: faite
    titre: "Prédiction : quatre réglages sur une même zone (X-005)"
    detail: "Deux tailles de zone par réglage, pour séparer le démarrage du calcul. Sur la grande zone, les quatre réglages tiennent en 223,5 à 239,3 s. Le lot de 8 ne déborde pas : 6 707 Mo."
  - date: 2026-11-16
    genre: bug
    statut: contourne
    titre: "La première mesure a payé seule la première lecture du disque"
    detail: "Le réglage mesuré en premier, le nôtre, sortait avec un débit de 46,8 blocs par seconde, deux fois celui des autres : un artefact de l'ordre des mesures. Contourné par une seconde passe complète, volume déjà lu (X-006)."
  - date: 2026-11-16
    genre: etape
    statut: faite
    titre: "Seconde passe (X-006) : aucun réglage ne fait mieux que le nôtre"
    detail: "Grande zone : 254,5 à 256,1 s pour les quatre. Le réglage compilé calcule plus vite une fois lancé (25,6 blocs par seconde contre 17,7 à 18,5) mais démarre en 85 s contre 8 à 19 s. Décision : garder notre réglage pour les longues prédictions, `--no-compile` pour les petits essais."
  - date: 2026-11-16
    genre: etape
    statut: faite
    titre: "Entraînement : processus de chargement et mesure intégrée (X-007)"
    detail: "`dataloader_workers` à 1, 2, 4 puis de nouveau 1, avec `benchmark` activé, sur 350 itérations. 0,342 à 0,373 s par itération, dont 0,001 s à attendre les données dans les quatre passes : le temps part dans le calcul. Nous restons à un processus."
---

Fait quand nous savons, chiffres mesurés sur notre machine, quels réglages garder pour la prédiction et pour l'entraînement, sans changer le résultat. Premier point de l'ordre d'essai de `docs/veille-optimisations.md`, accepté par Kanemonium le 2026-11-16.
