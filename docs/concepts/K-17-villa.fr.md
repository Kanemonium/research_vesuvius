---
id: K-17
langue: fr
titre: "villa, le dépôt commun du défi"
resume: "Le code officiel du Vesuvius Challenge, rassemblé dans un seul dépôt public. Nous l'utilisons ; nous ne l'avons pas écrit."
domaine: outils
ordre: 17
pistes: [P-400, P-410]
image: img/K-17-villa.svg
source: https://github.com/ScrollPrize/villa
date: 2026-11-15
---

# villa, le dépôt commun du défi

*Le code officiel du Vesuvius Challenge, rassemblé dans un seul dépôt public. Nous l'utilisons ; nous ne l'avons pas écrit.*

![Une boîte sombre contenant six tuiles colorées dont une est cerclée ; une flèche copie cette tuile vers un ordinateur, et une flèche en pointillé revient](img/K-17-villa.svg)

## L'idée

Le défi publie la plupart de son code en open source sur GitHub, surtout dans un grand dépôt, [ScrollPrize/villa](https://github.com/ScrollPrize/villa). On y trouve de quoi faire chaque étape du travail : déplier un rouleau, détecter l'encre, regarder le résultat. La racine du dépôt porte une licence MIT, la même que la nôtre ; certains dossiers ont la leur (`volume-cartographer` est sous GPL version 3) : à vérifier avant de reprendre du code.

## Comment ça marche

1. **Le dépôt** : plusieurs projets rangés côte à côte dans un seul dépôt (un « monorepo »). Parmi ses dossiers : `vesuvius`, `volume-cartographer` (l'outil de dépliage), `segmentation`, `ink-detection`.
2. **Le paquet `vesuvius`** : la bibliothèque Python qui contient l'entraînement et la prédiction d'encre du tutoriel. C'est la partie que nous utilisons.
3. **Notre copie** : clonée dans Ubuntu et figée au commit `2d3fb38`, pour que nos mesures restent reproductibles même si villa change.
4. **Le retour** : une amélioration se propose au dépôt par une demande de fusion. Nous n'en proposerons que pour un défaut réellement rencontré, avec la preuve avant et après.

*Les numéros renvoient à la planche.*

## Pourquoi ça compte ici

Quand une exécution cite « villa », c'est ce code-là qui tourne : nos fichiers ne contiennent que des réglages, des commandes et quelques scripts de lancement, de découpage et de mesure. X-002 montre ainsi ce que villa décide par défaut quand notre réglage ne dit rien (la perte, l'optimiseur). Les obstacles rencontrés en l'installant sont dans P-410 ; ce sont des contributions possibles, à vérifier d'abord.

## Le vocabulaire anglais

| Anglais | Français |
|---|---|
| *repository* | dépôt de code |
| *monorepo* | un seul dépôt pour plusieurs projets |
| *clone* | copie locale du dépôt |
| *commit* | état daté du code, identifié par un code |
| *pull request* | demande de fusion |
| *MIT license* | licence libre très permissive |
