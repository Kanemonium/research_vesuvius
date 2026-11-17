---
id: P-514
titre: "V1.4 : le carnet d'exécution et les parcours par domaine"
type: piste
domaine: pilotage
statut: validee
parent: P-510
date: 2026-11-15
---

## Constat

Un bouton à droite du titre d'une exécution ouvre son « carnet » : une copie à lire, présentée comme un notebook. D'abord le code utile avec ses annotations, puis ce que le programme a affiché, découpé en cellules et mis à jour pendant que l'exécution tourne.

## Réflexions

- **Kanemonium** (2026-11-15) : pensait que nos entraînements et nos prédictions tournaient dans un notebook, et voulait en lire une copie dans l'IHM, avec les résultats de chaque cellule en direct et les annotations reportées sur le code.
- **Agent C.** (2026-11-15) : elles tournent par des scripts, pas dans un notebook. Le journal porte déjà des repères (« étape k/n », « bande i/n », arrêt, reprise) : l'IHM s'en sert pour découper la sortie en cellules. Le code montré est celui de la page de l'exécution, avec les mêmes annotations.
- **Agent C.** (2026-11-15) : limite. Le programme de [ScrollPrize/villa](https://github.com/ScrollPrize/villa) n'écrit presque rien pendant une bande : « en direct » veut dire bande par bande. Une cellule très longue ne montre que son début et sa fin.
- **Kanemonium** (2026-11-15) : derrière chaque domaine de la carte, un graphe vertical des avancées, pour « agréger ma vision avec le sujet tout entier » : celles du défi pour le scan, le dépliage et l'encre, les nôtres pour le pilotage et les outils. Chaque nœud cliquable, avec le détail fonctionnel et technique et le prix associé.
- **Agent C.** (2026-11-15) : 61 avancées. Les 43 du défi viennent des pages de scrollprize.org gardées dans [ScrollPrize/villa](https://github.com/ScrollPrize/villa) ; 219 citations revérifiées mot pour mot avant écriture. Sept fiches nouvelles, K-18 à K-24. Limites : les prix mensuels n'ont pas tous été lus, et plusieurs dates sont absentes des sources.
- **Kanemonium** (2026-11-16) : un suivi du stockage (pris, restant, part occupée) à la place de la date dans la barre du haut, et deux pictos, carbone et papyrus, à la place des noms de thème, pour gagner de la place.
- **Agent C.** (2026-11-16) : fait. Mesuré à la mise en service : 431 Go pris, 43 Go restants, 91 % du disque C: occupés. Le disque virtuel de WSL, qui porte le jeu de données et l'image de X-003, y pèse 122 Go.
- **Kanemonium** (2026-11-17) : valide la V1.3 et la V1.4.
- **Kanemonium** (2026-11-17) : dans les exécutions, la colonne des cartes et le détail doivent défiler chacun pour soi ; et un tableau de mesures de X-008 débordait de sa carte.
- **Agent C.** (2026-11-17) : corrigé. La colonne a son propre défilement et s'ouvre sur la carte affichée. Dans une carte d'une demi-largeur, la remarque d'une mesure passe sous sa ligne au lieu de pousser le tableau hors du cadre.

## Suite

Découpage dans `ihm/lib/carnet.mjs`, vérifié par cinq tests ; vu à l'écran sur X-003 pendant qu'elle tourne. Livrée avec deux retouches : la colonne « Bloquée » à droite de « Faite », et les panneaux GitHub à hauteur d'écran. Le suivi du stockage et les pictos de thème sont livrés dans le commit `fd04cf1`. Validée par Kanemonium le 2026-11-17.
