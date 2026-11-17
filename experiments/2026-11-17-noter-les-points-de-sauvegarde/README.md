# Noter chaque point de sauvegarde sur les régions entières

Piste : `pilotage/pistes/P-310`, tâche `T-016`. Rendu : X-009 (`execution.yaml`). Suite de X-008.

## La question

La note que villa calcule pendant l'entraînement varie de 0,11 d'une fois à l'autre (X-008).
Quel point de sauvegarde garder, et avec quel chiffre comparer les essais suivants ?

## La commande

```bash
bash experiments/2026-11-17-noter-les-points-de-sauvegarde/essai.sh
```

Deux étapes (`etapes.sh`) : un essai sur le dernier point de sauvegarde, puis les vingt et un.
Relancer après un arrêt garde les prédictions déjà écrites.

La notation est celle des outils `sweep_checkpoints.py` et `eval_validation.py` de Hyojun Kwon
([khj1222/vesuvius-challenge](https://github.com/khj1222/vesuvius-challenge), licence MIT, commit
`c876e01`), lancés depuis une copie gardée hors du dépôt où seul le nom du paquet de villa est
remplacé. La prédiction est celle de [ScrollPrize/villa](https://github.com/ScrollPrize/villa)
(licence MIT, commit `2d3fb38`).

## Le résultat

Non mesuré : la page sera complétée à la fin de l'exécution.
