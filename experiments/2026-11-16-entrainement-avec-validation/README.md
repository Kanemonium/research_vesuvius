# Réentraîner la ligne de base avec une zone de validation

Piste : `pilotage/pistes/P-310`, décision `D-011`, tâche `T-016`. Rendu : X-008 (`execution.yaml`).
Origine : `docs/veille-optimisations.md`, section 2.

## La question

X-002 a appris sur toutes les régions annotées : rien ne permet de dire si un changement l'améliore.
Que vaut le même entraînement, noté sur des régions qu'il n'a jamais vues ?

## La commande

```bash
bash experiments/2026-11-16-entrainement-avec-validation/essai.sh
```

Trois étapes (`etapes.sh`) : mettre de côté quatre régions annotées, convertir le masque, entraîner.
Relancer après un arrêt reprend au dernier point de sauvegarde.

Le découpage est celui de l'outil `make_validation_mask.py` de Hyojun Kwon
([khj1222/vesuvius-challenge](https://github.com/khj1222/vesuvius-challenge), licence MIT, commit
`c876e01`), lancé tel quel depuis une copie gardée hors du dépôt. L'entraînement et sa validation sont
ceux de [ScrollPrize/villa](https://github.com/ScrollPrize/villa) (licence MIT, commit `2d3fb38`).

## Le résultat

Non mesuré : la page sera complétée à la fin de l'exécution.
