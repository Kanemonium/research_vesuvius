# Le Vesuvius Challenge

Relevé sur <https://scrollprize.org> le 14 novembre 2026. Les montants et les échéances
changent chaque mois : revérifier sur le site avant toute décision.

## Le défi

En 79 apr. J.-C., l'éruption du Vésuve ensevelit à Herculanum une villa et sa bibliothèque de
rouleaux de papyrus. La chaleur les a carbonisés, ce qui les a conservés, mais on ne peut plus
les ouvrir sans les briser. Le Vesuvius Challenge les lit à partir de scanners à rayons X.

État annoncé : 45 rouleaux et fragments scannés, 12 en cours de traçage, 4 avec du texte
récupéré. En 2026, PHerc. 1667 a été le premier rouleau entièrement déroulé et lu
virtuellement. La question n'est plus « est-ce possible » mais « comment le faire
automatiquement, sur tous les rouleaux ».

## La chaîne

1. **Scanner.** Un synchrotron produit une grille de voxels de plusieurs téraoctets.
2. **Déplier** (*virtual unwrapping*). Retrouver la feuille enroulée, la suivre, l'aplatir.
3. **Détecter l'encre** (*ink detection*). Un modèle rend une probabilité d'encre par pixel.
   Il ne lit pas le grec : ce sont des papyrologues qui lisent.

## Les prix ouverts (2 140 000 $ au total)

| Prix | Montant | But | Échéance |
|---|---|---|---|
| Grand Prix 2027 | 1 000 000 $, dont 800 000 $ au premier | dérouler et rendre lisible en entier un des 13 rouleaux éligibles | 25 juin 2027, 23 h 59 (heure du Pacifique) |
| Premières lettres (*First Letters*) | 50 000 $ par rouleau, 8 rouleaux au plus | 10 lettres dans 4 cm² d'un rouleau jamais lu | 25 juin 2027 |
| Titre de PHerc. Paris. 4 | 50 000 $ | trouver le titre du rouleau 1 | 25 juin 2027 |
| Prix de progrès (*Progress Prizes*) | 250 $ à 20 000 $ | contributions open source utiles | fin de chaque mois |

## Les règles que ce projet suit

- **Open source.** Pour recevoir un prix, la méthode doit être publiée sous licence permissive.
  Elle peut ne pas l'être au moment de la soumission. Ici : MIT, dès le départ.
- **Décision de l'organisateur.** Les prix sont attribués à la seule discrétion de Scroll Prize,
  Inc., après revue des équipes technique, d'annotation et de papyrologie.
- **Ce que l'équipe favorise** pour les prix de progrès : un travail publié tôt, réellement
  utilisé par la communauté, qui améliore des résultats sur les données publiques, corrige des
  défauts rencontrés en pratique (preuve avant/après) et est bien documenté. Les outils
  d'analyse ou d'audit isolés sont découragés.
- **Regrouper** les petites contributions d'un mois en une seule soumission ; soumettre à part
  une contribution importante.
- **Paiement.** Le gagnant fournit ses informations de paiement dans les 30 jours.
- **Données.** Les scans appartiennent à leurs institutions : pas de copie dans ce dépôt, et
  citation des sources selon la page « How to Cite » du site.

## Ressources

- Code : <https://github.com/ScrollPrize/villa> (VC3D, paquet Python `vesuvius`, lasagna, encre).
- Données : compartiment S3 `vesuvius-challenge-open-data` (format OME-Zarr, lisible par morceaux) ;
  jeux de données et modèles sur <https://huggingface.co/scrollprize>.
- Tutoriels : `/tutorial5` (encre), `/tutorial_VC3D`, `/tutorial_spiral`.
- Carte technique : `/2026_open_problems`. Navigateur de données : `/data_browser`.
- Entraide : Discord du défi.

Pages pas encore lues en détail : tutoriels de dépliage, « Data Formats », conditions d'usage des données.
