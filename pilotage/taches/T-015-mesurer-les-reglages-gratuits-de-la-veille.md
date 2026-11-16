---
id: T-015
titre: "Mesurer les réglages gratuits relevés par la veille"
statut: en-cours
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
    statut: en-cours
    titre: "Prédiction : quatre réglages sur une même zone (X-005)"
    detail: "Deux tailles de zone par réglage, pour séparer le démarrage du calcul. Une limite de 25 minutes par mesure, au cas où un lot de 8 déborderait de la mémoire vidéo."
  - date: 2026-11-16
    genre: etape
    statut: a-faire
    titre: "Entraînement : processus de chargement et mesure intégrée"
    detail: "`dataloader_workers` de 1 à 4, avec `benchmark` activé, sur quelques centaines d'itérations. Page d'exécution à écrire avant de lancer."
---

Fait quand nous savons, chiffres mesurés sur notre machine, quels réglages garder pour la prédiction et pour l'entraînement, sans changer le résultat. Premier point de l'ordre d'essai de `docs/veille-optimisations.md`, accepté par Kanemonium le 2026-11-16.
