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

Mesuré le 2026-11-17, en 2 h 38 min, sur 19 083 252 pixels étiquetés des quatre régions mises de côté.

- Meilleur F1 : 0,776 à l'itération 19 000 (seuil 176 sur 255, précision 78,9 %, rappel 76,4 %,
  justesse équilibrée 0,852). C'est le point de sauvegarde gardé et le chiffre à battre.
- Les itérations 18 000 (0,755) et 20 000 (0,768) et le point gardé par villa (17 500 : 0,755) sont à
  moins de 0,03, le seuil de bruit donné par l'auteur des outils.
- Jusqu'à l'itération 10 000, le F1 reste vers 0,40 : à peine mieux que répondre « encre » partout (0,373).
- Aucun arrêt de la prédiction avec `--mask-path` sur notre volume.

Le tableau complet, les courbes et deux aperçus sont dans `execution.yaml` (onglet « Exécutions » de l'IHM).
