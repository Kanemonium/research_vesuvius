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

Mesuré le 2026-11-17, en 2 h 19 min sans arrêt (détail dans `execution.yaml`) :

- 6 567 blocs d'entraînement et 4 987 de validation (X-002 : 8 098 et 0).
- Jusqu'à l'itération 10 000, la justesse équilibrée sur les régions mises de côté reste autour de
  0,50 ; elle monte ensuite jusqu'à 0,78 à 0,82 sur les cinq dernières notes.
- villa a gardé l'itération 17 500 : justesse équilibrée 0,816, encre retrouvée 89,8 %, fond reconnu
  73,5 %.
- Deux notes voisines diffèrent jusqu'à 0,11 (cinquante lots tirés au hasard chacune) : le choix du
  point de sauvegarde reste à confirmer sur les régions entières.
