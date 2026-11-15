# Pause et reprise : est-ce que ça marche pour de bon ?

Piste : `pilotage/pistes/P-420`, décision `D-009`, tâche `T-011`. Rendu : X-004 (`execution.yaml`).

## La question

Avant une prédiction de plusieurs heures (X-003), vérifier sur un petit rectangle du segment que
l'on peut la mettre en pause, l'arrêter et la reprendre sans tout refaire.

## La commande

```bash
bash experiments/2026-11-15-pause-et-reprise/essai.sh
```

Quatre étapes (`etapes.sh`) : la zone d'un seul tenant, la même zone en deux bandes, la comparaison
des deux images, puis la reprise d'un entraînement depuis son dernier point de sauvegarde.
Relancer la commande après un arrêt reprend où l'on en était.

Le programme exécuté est celui de [ScrollPrize/villa](https://github.com/ScrollPrize/villa)
(licence MIT, commit `2d3fb38`) ; nous n'avons écrit que le découpage, l'assemblage et le lanceur.

## Le résultat

| Question | Réponse mesurée |
|---|---|
| La pause gèle-t-elle le programme sans rien perdre ? | Oui : gelé 28 s depuis l'IHM, puis reparti |
| Un essai arrêté reprend-il où il en était ? | Oui : à la bande interrompue, le reste est sauté |
| Deux bandes donnent-elles la même image qu'un seul tenant ? | Presque : 0,9 % des pixels diffèrent d'un niveau sur 255, sans couture |
| Un entraînement repart-il de son dernier point de sauvegarde ? | Oui : au pas 20 000, 20 itérations de plus |

Chaque bande coûte 29 à 35 secondes de démarrage. Pic de mémoire vidéo en prédiction, lot de 4 : 4 869 Mo.

## Ce que ça ne dit pas

- La vitesse de prédiction : la zone est trop petite pour la mesurer proprement.
- Le comportement sur des heures, notamment la mémoire vive.
- Une pause ne survit pas à un redémarrage : il faut alors relancer, et la bande en cours est refaite.
