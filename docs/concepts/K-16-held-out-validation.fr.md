---
id: K-16
langue: fr
titre: "La validation tenue à l'écart"
resume: "Pour savoir si un modèle a compris ou appris par cœur, on l'interroge sur une zone qu'il n'a jamais vue."
domaine: apprentissage
ordre: 16
pistes: [P-310, P-320, P-250]
image: img/K-16-held-out-validation.svg
source: https://scrollprize.org/tutorial5
date: 2026-11-15
---

# La validation tenue à l'écart

*Pour savoir si un modèle a compris ou appris par cœur, on l'interroge sur une zone qu'il n'a jamais vue.*

![Une feuille écrite avec une zone encadrée en trait plein et une autre en pointillé ; à droite deux courbes, l'une continue de descendre, l'autre s'en écarte](img/K-16-held-out-validation.svg)

## L'idée

Un modèle peut très bien réussir sur les exemples qu'il a vus et échouer partout ailleurs. Pour le savoir, il faut l'interroger sur des données qu'il n'a jamais vues : une zone gardée de côté, jamais montrée pendant l'entraînement, ou un autre segment.

## Comment ça marche

1. **La zone d'entraînement** : là où les étiquettes servent à corriger le modèle.
2. **La zone de validation** : étiquetée de la même façon, mais exclue de l'entraînement. Elle ne sert qu'à mesurer.
3. **L'erreur d'entraînement** baisse presque toujours : le modèle s'ajuste à ce qu'il voit.
4. **Le décrochage** : si la mesure de validation cesse de s'améliorer pendant que l'erreur d'entraînement continue de baisser, le modèle commence à apprendre par cœur. C'est le surapprentissage.

*Les numéros renvoient à la planche.*

## Pourquoi ça compte ici

Le segment du tutoriel n'a pas de zone de validation, et le tutoriel le dit : ce premier entraînement ne rend que la perte d'entraînement. C'est pourquoi X-002 ne permet pas de dire ce que vaut le modèle. Pour comparer honnêtement deux réglages (des blocs de 128 ou de 256), il faudra d'abord mettre une zone de côté. Quand elle existe, villa y mesure l'exactitude équilibrée.

## Le vocabulaire anglais

| Anglais | Français |
|---|---|
| *held-out* | tenu à l'écart |
| *validation mask* | masque de validation |
| *overfitting* | surapprentissage, apprentissage par cœur |
| *balanced accuracy* | exactitude équilibrée |
| *generalize* | réussir sur ce qu'on n'a pas vu |
