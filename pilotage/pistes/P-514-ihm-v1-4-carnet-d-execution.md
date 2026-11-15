---
id: P-514
titre: "V1.4 : le carnet d'exécution"
type: piste
domaine: pilotage
statut: en-cours
parent: P-510
date: 2026-11-15
---

## Constat

Un bouton à droite du titre d'une exécution ouvre son « carnet » : une copie à lire, présentée comme un notebook. D'abord le code utile avec ses annotations, puis ce que le programme a affiché, découpé en cellules et mis à jour pendant que l'exécution tourne.

## Réflexions

- **Kanemonium** (2026-11-15) : pensait que nos entraînements et nos prédictions tournaient dans un notebook, et voulait en lire une copie dans l'IHM, avec les résultats de chaque cellule en direct et les annotations reportées sur le code.
- **Agent C.** (2026-11-15) : elles tournent par des scripts, pas dans un notebook. Le journal porte déjà des repères (« étape k/n », « bande i/n », arrêt, reprise) : l'IHM s'en sert pour découper la sortie en cellules. Le code montré est celui de la page de l'exécution, avec les mêmes annotations.
- **Agent C.** (2026-11-15) : limite. Le programme de [ScrollPrize/villa](https://github.com/ScrollPrize/villa) n'écrit presque rien pendant une bande : « en direct » veut dire bande par bande. Une cellule très longue ne montre que son début et sa fin.

## Suite

Découpage dans `ihm/lib/carnet.mjs`, vérifié par cinq tests ; vu à l'écran sur X-003 pendant qu'elle tourne. Livrée avec deux retouches : la colonne « Bloquée » à droite de « Faite », et les panneaux GitHub à hauteur d'écran. À valider par Kanemonium.
