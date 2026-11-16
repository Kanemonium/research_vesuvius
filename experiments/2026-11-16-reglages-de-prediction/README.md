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

Non mesuré : la page sera complétée à la fin de l'exécution.
