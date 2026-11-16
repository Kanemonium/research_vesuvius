# Réglages de prédiction : lesquels vont plus vite sur notre carte ?

Piste : `pilotage/pistes/P-420`, décision `D-011`, tâche `T-015`. Rendu : X-005 (`execution.yaml`).
Origine : `docs/veille-optimisations.md`, section 1.

## La question

La veille a relevé des options de prédiction déjà présentes dans notre installation de
[ScrollPrize/villa](https://github.com/ScrollPrize/villa) (licence MIT, commit `2d3fb38`), que
[gomyway](https://github.com/gomyway) mesure bien plus rapides sur une RTX 4090
([villa #2428](https://github.com/ScrollPrize/villa/pull/2428)). Qu'en est-il sur une RTX 3080 de 8 Go,
avec notre modèle ?

## La commande

```bash
bash experiments/2026-11-16-reglages-de-prediction/essai.sh
```

Quatre réglages (`etapes.sh`), chacun sur une petite et une grande zone, puis la comparaison des
images et un tableau (`tableau.py`). Relancer après un arrêt saute les mesures déjà faites.

## Le résultat

Deux passes : X-005, puis X-006 une fois le volume déjà lu (`controle.sh`). Chiffres de la seconde.

| Réglage | Grande zone (4 386 blocs) | Débit une fois lancé | Démarrage | Pic de mémoire vidéo |
|---|---|---|---|---|
| Lot de 4, compilé (le nôtre) | 256,1 s | 25,6 blocs/s | 85 s | 4 151 Mo |
| Lot de 4, sans compilation | 254,5 s | 18,4 blocs/s | 16 s | 4 500 Mo |
| Lot de 8, sans compilation | 254,9 s | 17,7 blocs/s | 8 s | 6 813 Mo |
| Lot de 8, fils de lecture et cache | 255,9 s | 18,5 blocs/s | 19 s | 6 787 Mo |

Aucun réglage ne fait mieux que le nôtre sur la grande zone. Le gain de cinq fois mesuré par gomyway
sur une RTX 4090 ne se retrouve pas ici. Nous gardons notre réglage pour une prédiction entière, et
`--no-compile` pour les petits essais, où il fait gagner environ une minute de démarrage.

Les images diffèrent d'un niveau sur 255 pour 1,3 % des pixels entre deux réglages, et pour 0,9 %
entre deux passes du même réglage.

## Ce que ça ne dit pas

- D'une passe à l'autre, la même mesure a bougé de 7 à 15 % : plus que l'écart entre réglages.
- X-003 a tenu 17,3 blocs par seconde sur cinq heures, pas 25,6 : sur un volume jamais lu, la lecture
  du disque pèse sans doute plus que le calcul. Non mesuré.
- Les fils de lecture et le cache n'ont été essayés que sur un volume déjà lu.
