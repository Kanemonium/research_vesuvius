# Des blocs de 256 tiennent-ils dans nos 8 Go ?

Piste : `pilotage/pistes/P-310`, décision `D-011`, tâche `T-019`. Rendu : X-010 (`execution.yaml`).
Origine : `docs/veille-optimisations.md`, sections 1 et 8.

## La question

La recette du tutoriel entraîne sur des blocs de 64 × 256 × 256. En lot de 2, notre carte débordait
(X-001 : 7 996 Mo, 21,7 s par itération). En lot de 1, tient-elle, et à quelle vitesse ?

## La commande

```bash
bash experiments/2026-11-17-blocs-de-256/essai.sh
```

Un entraînement de 350 itérations (`blocs-256.json`), sans notation ni point de sauvegarde, avec la
mesure intégrée de [ScrollPrize/villa](https://github.com/ScrollPrize/villa) (licence MIT, commit
`2d3fb38`). Le réglage, lot de 1 et deux lots cumulés, est celui que LynnHenry décrit dans la
[proposition villa 2298](https://github.com/ScrollPrize/villa/pull/2298). Une limite de quarante
minutes arrête l'essai si la mémoire déborde.

## Le résultat

Mesuré le 2026-11-17 : la carte ne tient pas.

- Mémoire vidéo pleine : 7 993 Mo au pic, sur 8 192 (Windows en occupait 1 800 avant de lancer).
- 125 itérations sur 350 en 40 min 54 s, puis arrêt par la limite : 19,6 s par itération en moyenne,
  le plus souvent 26 à 34 s, avec un passage de cinq minutes à 3,5 s que nous n'expliquons pas.
- Blocs de 128 en lot de 2, pour comparaison : 0,39 s par itération (X-008).
- À ce rythme, 20 000 itérations prendraient environ 109 h (calculé, pas mesuré).

La mesure intégrée de villa n'a rien écrit, faute d'aller au bout : les chiffres viennent de la barre
de progression du journal. Pas d'entraînement complet en blocs de 256 avec ce réglage. Non essayé :
une taille de 192, la machine avec le reste fermé, le recalcul des étapes intermédiaires.
