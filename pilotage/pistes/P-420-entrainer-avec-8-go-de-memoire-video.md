---
id: P-420
titre: "Entraîner avec 8 Go de mémoire vidéo"
type: piste
domaine: outils
statut: a-explorer
parent: P-400
date: 2026-11-14
---

## Constat

Notre carte est une RTX 3080 Laptop avec 8 Go de mémoire vidéo. Nous ne savons pas encore si la recette du tutoriel y tient.

## Cause racine

À mesurer : rien n'a encore été lancé.

## Réflexions

- **Agent C.** (2026-11-14) : relevé depuis Ubuntu, 1,9 Go sur les 8 Go sont déjà pris par l'affichage de Windows : il reste environ 6 Go pour l'entraînement. Le tutoriel prévoit le cas : passer à un lot de 1, ou réduire les blocs à 64 × 128 × 128. WSL ne reçoit par défaut que 6 Go de mémoire vive sur les 13,7 de la machine.

## Suite

Tâche T-004. Si la recette ne tient pas, les réglages qui la font tenir seront utiles à d'autres.
