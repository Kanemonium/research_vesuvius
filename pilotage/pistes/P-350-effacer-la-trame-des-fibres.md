---
id: P-350
titre: "Effacer la trame des fibres"
type: piste
domaine: encre
statut: a-explorer
parent: P-300
date: 2026-11-16
---

## Constat

Sur l'image d'encre X-003, le quadrillage des fibres du papyrus se voit partout. Le modèle lui donne une réponse moyenne : la réponse médiane sur le fond étiqueté est de 129 sur 255, alors qu'elle devrait être basse.

## Cause racine

Non établie. L'encre et le papyrus carbonisé se ressemblent aux rayons X, et les fibres ont un relief propre : le modèle n'a peut-être pas assez d'exemples de fond pour apprendre que ce relief n'est pas de l'encre.

## Réflexions

- **Kanemonium** (2026-11-16) : quelqu'un a-t-il essayé de corriger ou d'effacer les stries du papyrus, et d'additionner la détection et l'effacement ?
- **Agent C.** (2026-11-16) : nous n'avons trouvé personne qui le fasse. Cherché : les pages du défi, l'historique des 267 prix, le code et les issues et demandes de fusion de [ScrollPrize/villa](https://github.com/ScrollPrize/villa), cinq recherches sur le Discord. Ce n'est pas une preuve d'absence.
- **Agent C.** (2026-11-16) : ce qui s'en approche. L'équipe publie un modèle qui reconnaît les fibres horizontales et verticales, fait pour le dépliage, et un modèle à quatre classes (fond, fibre verticale, fibre horizontale, encre) où l'encre l'emporte sur la fibre. Sur le Discord, un participant (pseudonyme vadim) signale qu'un résidu d'ajustement de ligne, pixel par pixel, fait ressortir l'encre sur une surface affinée.
- **Agent C.** (2026-11-16) : trois façons d'essayer, de la plus simple à la plus lourde. Filtrer la carte d'encre en fréquences pour en retirer le motif répété (K-27). Se servir du modèle de fibres de l'équipe comme d'un masque. Entraîner avec la fibre comme classe à part, à la manière du modèle à quatre classes.

## Suite

T-013 : essayer la première façon sur l'image de X-003, sans rien réentraîner, et mesurer l'effet sur le fond étiqueté. À faire après la veille sur les optimisations (D-011). Rien n'est mesuré.
