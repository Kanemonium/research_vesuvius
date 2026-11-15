---
id: K-11
langue: fr
titre: "Le réseau en U"
resume: "Un réseau qui résume l'image en la réduisant, puis la redessine à sa taille, sans perdre les détails en route."
domaine: apprentissage
ordre: 11
pistes: [P-310, P-420]
image: img/K-11-u-net.svg
source: https://arxiv.org/abs/1505.04597
date: 2026-11-15
---

# Le réseau en U

*Un réseau qui résume l'image en la réduisant, puis la redessine à sa taille, sans perdre les détails en route.*

![Un carré de scan entre dans une suite de blocs qui descendent puis remontent en forme de U ; des passerelles relient les deux branches ; une image nette sort](img/K-11-u-net.svg)

## L'idée

Pour dire où est l'encre, il faut à la fois voir large (le contexte) et répondre fin (pixel par pixel). Le réseau en U, ou U-Net, fait les deux : une branche descend en résumant, l'autre remonte en redessinant.

## Comment ça marche

1. **L'entrée** : un bloc de scan (K-12).
2. **La descente** : à chaque étage, le bloc est réduit et décrit par davantage de filtres. Le réseau voit de plus en plus large, de moins en moins fin.
3. **Les passerelles** : chaque étage de la descente recopie ses détails vers l'étage d'en face, pour que la remontée ne les ait pas perdus.
4. **La remontée et la sortie** : le résumé est redéployé étage par étage jusqu'à une carte de la taille d'origine, une valeur d'encre par pixel.

*Les numéros renvoient à la planche.*

## Pourquoi ça compte ici

Le modèle du tutoriel, `vesuvius_unet`, est un U à six étages, de 32 à 320 filtres, qui travaille en 3D. Dans X-002, le journal l'annonce au démarrage et le fichier de poids compte 202 467 329 nombres réglables. Nous n'avons rien changé à cette architecture : villa la configure seule à partir de la taille du bloc.

## Le vocabulaire anglais

| Anglais | Français |
|---|---|
| *U-Net* | réseau en U |
| *encoder, decoder* | descente, remontée |
| *skip connection* | passerelle entre les deux branches |
| *stage* | étage |
| *features* | filtres, descripteurs appris |
