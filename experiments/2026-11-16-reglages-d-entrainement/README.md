# Entraînement : plus de processus de chargement, est-ce plus rapide ?

Piste : `pilotage/pistes/P-420`, décision `D-011`, tâche `T-015`. Rendu : X-007 (`execution.yaml`).
Origine : `docs/veille-optimisations.md`, section 1.

## La question

Notre entraînement (X-002) n'utilise qu'un processus pour préparer les blocs. En ajouter le rend-il
plus rapide, sans dépasser nos 6,8 Go de mémoire vive ?

## La commande

```bash
bash experiments/2026-11-16-reglages-d-entrainement/essai.sh
```

Le même entraînement de 350 itérations avec 1, 2, 4 puis de nouveau 1 processus (`etapes.sh`), la
mesure intégrée de [ScrollPrize/villa](https://github.com/ScrollPrize/villa) (licence MIT, commit
`2d3fb38`) activée, puis un tableau (`resume.py`). Relancer après un arrêt saute les mesures déjà faites.

## Le résultat

Non mesuré : la page sera complétée à la fin de l'exécution.
