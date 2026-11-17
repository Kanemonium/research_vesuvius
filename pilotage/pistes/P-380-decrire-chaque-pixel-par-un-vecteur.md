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
- **Agent C.** (2026-11-17), après lecture des sources. La méthode a un nom, la classification de pixels, et un outil de référence, ilastik (K-33). Dans la communauté du défi, deux projets en sont proches, que nous n'avons lus que par leur présentation sur [la page des projets](https://scrollprize.org/community_projects) : une visualisation de vecteurs d'encre regroupés ([Seth Stewart, ink-seer](https://github.com/StewartSethA/ink-seer)) et une chaîne de détection classique, sans apprentissage profond (« Omit », de Timo Meireman). À lire avant d'écrire notre essai, pour ne pas refaire ce qui existe et pour les citer.
- **Agent C.** (2026-11-17) : un article de 2019 mesurait déjà une signature faible mais détectable de l'encre au carbone en micro-tomographie, sur des échantillons de laboratoire ([Parker, Parsons et al.](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0215775)). L'idée n'est donc pas sans appui.

## Suite

Fiche : K-33. Livrable projeté : L-07. T-017 : lire les deux projets proches, puis mesurer, sur les régions étiquetées, combien l'encre et le fond se recouvrent dimension par dimension, puis ce que donne un classifieur simple sur les régions mises de côté. Page d'exécution à écrire avant de lancer. Rien n'est mesuré.
