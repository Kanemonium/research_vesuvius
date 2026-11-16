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

| Processus de chargement | Temps par itération | Dont attente des données |
|---|---|---|
| 1 | 0,373 s | 0,001 s |
| 2 | 0,342 s | 0,001 s |
| 4 | 0,369 s | 0,001 s |
| 1, seconde passe | 0,364 s | 0,001 s |

L'entraînement n'attend pas ses données : le temps part dans le calcul. Ajouter des processus de
chargement n'apporte rien de sûr ; nous restons à un. Pic de mémoire vidéo alloué : 3 621 Mo.

## Ce que ça ne dit pas

- Deux processus sortent 6 à 8 % plus vite sur une seule passe, quand deux passes identiques
  diffèrent de 2,5 % : trop peu pour conclure.
- Le pic de mémoire vive pendant les passes n'a pas été relevé.
- Rien sur un entraînement de deux heures, ni sur la qualité du modèle.
