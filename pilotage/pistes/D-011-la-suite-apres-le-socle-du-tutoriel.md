---
id: D-011
titre: "Après le socle du tutoriel : l'ordre de la suite"
type: decision
domaine: encre
statut: validee
parent: P-310
date: 2026-11-16
---

## Constat

Le socle du tutoriel d'encre est fait : installation, entraînement à plat, prédiction (X-001 à X-004). Il reste cinq parties du tutoriel : le 3D natif, le jeu de données complet, l'étiquetage itératif, les modèles partagés à 9 µm, et l'entraînement de la recette à 9 µm.

## Réflexions

- **Agent C.** (2026-11-16) : ordre proposé. Regarder l'image de X-003 à pleine résolution ; une zone de validation puis un nouvel entraînement ; les modèles partagés à 9 µm ; l'étiquetage itératif. Le 3D natif et le jeu complet plus tard.
- **Kanemonium** (2026-11-16) : d'accord sur l'ordre, avec quatre précisions. Regarder l'image tout de suite. Avant tout nouvel entraînement, faire une veille générale des optimisations, proposées par d'autres ou encore à imaginer, pour réduire le temps d'entraînement et améliorer la qualité des prédictions. Pour les modèles à 9 µm, faire le moment venu une revue de ce que propose le tutoriel et de nos propres pistes. L'étiquetage itératif, quand nous y serons.
- **Kanemonium** (2026-11-16) : le 3D natif ne doit pas être écarté. Il faudra trouver comment s'y essayer, quitte à chercher des astuces d'optimisation, mathématiques ou informatiques, inexplorées ou non appliquées dans ce domaine.
- **Kanemonium** (2026-11-16) : le téléchargement du jeu complet attendra son nouvel ordinateur, attendu dans la semaine, avec 2 To de disque NVMe.
- **Kanemonium** (2026-11-16) : deux idées à consigner avant la veille. Effacer les stries du papyrus et additionner détection et effacement (P-350) ; se servir de jeux de données spécialisés hébergés sur Kaggle (P-360). Si personne ne l'a fait, les inscrire dans les étapes à mener.
- **Agent C.** (2026-11-16) : veille faite, sur trois terrains : le code et les propositions de [ScrollPrize/villa](https://github.com/ScrollPrize/villa), la communauté du défi, la littérature. Synthèse dans `docs/veille-optimisations.md`, avec pour chaque point s'il a été revérifié ou seulement relevé. Rien n'y est mesuré chez nous. Trois constats : plusieurs gains ne coûtent qu'un réglage déjà présent dans notre installation ; un harnais de validation existe pour notre segment exact ([khj1222/vesuvius-challenge](https://github.com/khj1222/vesuvius-challenge)) ; l'outil qui ramène le jeu de 92 Go à 2,4 Go, cherché le premier jour, est la proposition villa 2298 de LynnHenry, encore ouverte.

## Décision

1. Regarder ensemble l'image de X-003 à pleine résolution (fin de T-005).
2. Veille sur les optimisations d'entraînement et de qualité, avant de réentraîner avec une zone de validation.
3. Modèles partagés à 9 µm, précédés d'une revue du tutoriel et de nos pistes.
4. Étiquetage itératif.

Deux idées de Kanemonium s'ajoutent, à essayer après la veille : effacer la trame des fibres dans la carte d'encre (P-350, T-013), et évaluer une note de lisibilité en aval à partir de jeux de lettres grecques (P-360, T-014).

Hors de cet ordre, à ne pas perdre de vue : le 3D natif, à tenter par l'optimisation ; le jeu de données complet, après l'arrivée du nouvel ordinateur.

## Suite

T-005 pour le premier point, terminée. La veille du deuxième point propose un ordre d'essai (`docs/veille-optimisations.md`, section 8), à décider par Kanemonium. Les suivants auront leur tâche quand nous y arriverons. Rien n'est mesuré sur la faisabilité du 3D natif dans 8 Go de mémoire vidéo, ni sur ce que demande le rendu à 9 µm.
