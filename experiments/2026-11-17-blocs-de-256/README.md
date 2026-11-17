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

Non mesuré : l'essai n'est pas lancé.
