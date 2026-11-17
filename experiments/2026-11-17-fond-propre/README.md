# Où prendre du fond propre ?

Piste : `pilotage/pistes/P-310`, décision `D-011`, tâche `T-020`. Rendu : X-011 (`execution.yaml`).
Origine : `docs/veille-optimisations.md`, sections 3 et 8.

## La question

Notre modèle répond « à moitié encre » sur le papyrus qu'il n'a jamais vu corrigé (X-003). Le
tutoriel dit que le fond compte autant que l'encre dans la zone de supervision, et la nôtre ne couvre
que 5,8 % de l'image, autour des lettres. Où prendre du papyrus vierge à lui montrer ?

## La commande

```bash
bash experiments/2026-11-17-fond-propre/essai.sh
```

`candidats.py` relit la carte d'encre de X-003 et le masque de supervision du tutoriel, écarte les
carrés qui touchent une zone vide ou une annotation, et en propose seize en deux familles. Il écrit
une planche et une carte d'ensemble dans `local/apercus/` (hors du dépôt) et la liste des carrés dans
`candidats.json`. Il ne décide pas : c'est Kanemonium qui dit quels carrés sont vierges.

La suite suit la démarche décrite par [ScrollPrize/villa](https://github.com/ScrollPrize/villa)
(licence MIT) : écrire un masque de supervision en version 2, hors du dépôt, puis réentraîner.

## Le résultat

Mesuré le 2026-11-17, en une à deux minutes.

- 957 carrés de 1 024 pixels sur 1 550 sont sans zone vide et à plus de 512 pixels d'une annotation.
- Sur ces carrés, le modèle de X-002 répond en moyenne 141 sur 255 : aucun n'est franchement sombre.
- Seize sont proposés : huit où il voit le moins d'encre (0,9 à 2,3 % de pixels très clairs), huit
  d'un gris moyen et uniforme (10,1 à 15,8 %). Presque tous tombent en bas et à droite du segment.
- Les carrés 9, 11 et 14 touchent le bord du segment.

Choix fait le 2026-11-17 par Kanemonium, sur proposition d'Agent C. (`choix.json`) : neuf carrés
comme fond (1, 2, 5, 6, 8, 10, 12, 13, 15), deux comme contrôle (4, 16), cinq écartés (3, 7 : douteux ;
9, 11, 14 : au bord du segment).

## La suite : réentraîner (X-012)

```bash
bash experiments/2026-11-17-fond-propre/entrainer.sh
```

Six étapes (`etapes-entrainement.sh`) : écrire les étiquettes en version 2 (`masques.py`), les
convertir, mesurer le modèle de X-008 sur les carrés (`mesurer_carres.py`), entraîner
(`fond-propre-128.json`), noter les quatre derniers points de sauvegarde avec les outils de Hyojun
Kwon ([khj1222/vesuvius-challenge](https://github.com/khj1222/vesuvius-challenge), licence MIT),
puis mesurer le meilleur sur les carrés. Relancer après un arrêt reprend.

Résultat (2026-11-17, 3 h 05 min 51 s) : essai nul. L'exécution est allée au bout, mais villa ne
garde un bloc d'entraînement que si l'encre étiquetée y couvre au moins 5 % du bloc
(`patch_min_labeled_coverage`). Les carrés de fond n'ont donc donné aucun bloc : 11 554 blocs avant
comme après, et un modèle qui note exactement comme celui de X-008 (F1 0,7762 à l'itération 19 000).

Ce qui est acquis : le chiffre d'avant. Au seuil 176, le modèle de X-008 marque comme encre 2,65 %
des neuf carrés « fond » et 3,30 % des deux carrés de contrôle.

À faire avant de relancer : compter les blocs que donne un réglage admettant les blocs sans encre.
