---
id: P-380
titre: "Décrire chaque pixel par un vecteur"
type: piste
domaine: encre
statut: a-explorer
parent: P-300
date: 2026-11-17
---

## Constat

Idée de Kanemonium. Transformer l'image, avant toute lecture, en une liste de vecteurs : pour chaque pixel, sa probabilité d'encre et celle de son voisinage dans un rayon choisi. Puis ajouter des dimensions et voir si l'on sépare l'encre du papyrus même quand leur valeur agrégée est la même.

## Cause racine

Non établie. Rien n'est mesuré.

## Réflexions

- **Kanemonium** (2026-11-17) : un repère (probabilité d'encre ; probabilité d'encre autour, dans un rayon décidé), puis des dimensions en plus, pour distinguer papyrus et encre à valeur finale identique.
- **Agent C.** (2026-11-17) : c'est ce qu'un réseau fait sans le montrer : ses convolutions fabriquent des milliers de dimensions par pixel (K-11). L'intérêt de le faire à la main est ailleurs : peu de dimensions, que l'on comprend, calculées sans carte graphique, et dont on mesure l'apport une à une.
- **Agent C.** (2026-11-17) : dimensions possibles, toutes tirées du volume autour de la surface. La valeur de chacune des 65 couches en profondeur (deux pixels de même moyenne peuvent avoir deux profils différents) ; la moyenne et la dispersion dans deux ou trois rayons ; la force des bords ; les grandeurs inspirées de la physique de P-370.
- **Agent C.** (2026-11-17) : nous avons de quoi juger depuis X-008. Les mêmes quatre régions mises de côté, la même justesse équilibrée : un classifieur simple sur ces vecteurs se compare directement au modèle (0,816 à l'itération 17 500, note bruitée). S'il s'en approche, le signal est simple et le gros modèle est peut-être mal employé ; s'il reste à 0,5, le signal n'est pas dans ces dimensions.

## Suite

T-017 : mesurer, sur les régions étiquetées, combien l'encre et le fond se recouvrent dimension par dimension, puis ce que donne un classifieur simple sur les régions mises de côté. Page d'exécution à écrire avant de lancer. Rien n'est mesuré.
