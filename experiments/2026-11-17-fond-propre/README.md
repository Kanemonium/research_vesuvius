# Où prendre du fond propre ?

Piste : `pilotage/pistes/P-310`, décision `D-011`, tâche `T-020`. Rendu : X-011 (`execution.yaml`).
Origine : `docs/veille-optimisations.md`, sections 3 et 8.

## La question

Notre modèle répond « à moitié encre » sur le papyrus qu'il n'a jamais vu corrigé (X-003). Le
tutoriel dit que le fond compte autant que l'encre dans la zone de supervision, et la nôtre ne couvre
que 5,8 % de l'image, autour des lettres. Où prendre du papyrus vierge à lui montrer ?

## La commande

```bash
bash experiments/2026-11-17-fond-propre/essai.sh
```

`candidats.py` relit la carte d'encre de X-003 et le masque de supervision du tutoriel, écarte les
carrés qui touchent une zone vide ou une annotation, et en propose seize en deux familles. Il écrit
une planche et une carte d'ensemble dans `local/apercus/` (hors du dépôt) et la liste des carrés dans
`candidats.json`. Il ne décide pas : c'est Kanemonium qui dit quels carrés sont vierges.

La suite suit la démarche décrite par [ScrollPrize/villa](https://github.com/ScrollPrize/villa)
(licence MIT) : écrire un masque de supervision en version 2, hors du dépôt, puis réentraîner.

## Le résultat

Non mesuré : l'essai n'est pas lancé.
