---
id: K-20
langue: fr
titre: "La généralisation entre rouleaux"
resume: "Un modèle qui lit un rouleau peut ne presque rien voir dans un autre : c'est le principal verrou de l'encre."
domaine: encre
ordre: 20
pistes: [P-320]
image: img/K-20-cross-scroll-generalisation.svg
source: https://github.com/ScrollPrize/villa/blob/2d3fb38d33a18b257230c0bd23986436c3d4722e/scrollprize.org/docs/37_2026_open_problems.md
date: 2026-11-15
---

# La généralisation entre rouleaux

*Un modèle qui lit un rouleau peut ne presque rien voir dans un autre : c'est le principal verrou de l'encre.*

![Un modèle entraîné sur un rouleau le lit bien, puis ne trouve presque rien dans un autre rouleau](img/K-20-cross-scroll-generalisation.svg)

## L'idée

Généraliser, c'est réussir sur des données que le modèle n'a pas vues. Entre deux rouleaux, ce passage échoue souvent, et l'équipe du défi écrit qu'elle n'a parfois aucune explication.

## Comment ça marche

1. **Un rouleau** sert à l'entraînement.
2. **Sur ce rouleau**, le modèle fait apparaître des lettres.
3. **Un autre rouleau**, scanné de la même façon.
4. **Presque rien** : des taches, ou un résultat qui plafonne.

*Les numéros renvoient à la planche.*

## Pourquoi ça compte ici

Causes possibles citées par l'équipe : le scan ne capte pas assez de signal, la surface est légèrement mal placée, les étiquettes ne sont pas au bon endroit, le modèle s'appuie sur les mauvais indices, ou l'encre n'a pas la même forme ni la même chimie d'un rouleau à l'autre. On ne sait pas distinguer de façon fiable « pas d'encre » de « encre pas encore récupérée ». La piste suivie : des modèles entraînés sur plusieurs rouleaux à la fois. Les modèles publics à 9 µm sont entraînés sur quatre rouleaux ; ils restent sensibles à un décalage de la surface en profondeur.

## Le vocabulaire anglais

| Anglais | Français |
|---|---|
| *generalisation* | généralisation |
| *cross-scroll model* | modèle entraîné sur plusieurs rouleaux |
| *scroll-specific model* | modèle propre à un rouleau |
| *bottleneck* | goulot, verrou |
