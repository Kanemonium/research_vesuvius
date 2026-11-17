---
id: T-020
titre: "Étendre la supervision au fond propre"
statut: en-cours
piste: P-310
priorite: 1
responsable: "Agent C."
echeance: null
issue: null
creee: 2026-11-17
etapes:
  - date: 2026-11-17
    genre: etape
    statut: faite
    titre: "Lire comment villa prend une nouvelle version d'étiquettes"
    detail: "Un fichier `_supervision_mask_v2` à côté du premier, et `label_version` dans le réglage : rien n'est écrasé, et les entraînements passés restent rejouables en `v1`. Sans `label_version`, villa prend seule la version la plus haute : à fixer dans chaque réglage."
  - date: 2026-11-17
    genre: etape
    statut: faite
    titre: "Proposer seize carrés candidats (X-011)"
    detail: "957 carrés possibles sur 1 550 ; seize proposés, presque tous en bas et à droite du segment. Le modèle y répond 103 à 160 sur 255 en moyenne. Les carrés 9, 11 et 14 touchent le bord du segment."
  - date: 2026-11-17
    genre: etape
    statut: faite
    titre: "Kanemonium dit quels carrés sont vierges"
    detail: "Il retient la proposition d'Agent C. : neuf carrés comme fond (1, 2, 5, 6, 8, 10, 12, 13, 15), deux comme contrôle (4, 16), cinq écartés (3 et 7, douteux ; 9, 11 et 14, au bord du segment). Jugement à l'œil, par deux non-papyrologues."
  - date: 2026-11-17
    genre: etape
    statut: a-faire
    titre: "Mesurer le modèle actuel sur les carrés de contrôle"
    detail: "Le point 19 000 de X-008 : quelle part d'un carré vierge il marque comme encre, au seuil 176. C'est le chiffre d'avant. Prévu comme troisième étape de X-012."
  - date: 2026-11-17
    genre: etape
    statut: a-faire
    titre: "Écrire le masque en version 2 et réentraîner"
    detail: "Page X-012 écrite. Mêmes régions mises de côté que X-008. Environ 16 Go de points de sauvegarde. La place est réglée le 2026-11-17 : 46,7 Go libres après le tri et le compactage du disque virtuel."
  - date: 2026-11-17
    genre: etape
    statut: a-faire
    titre: "Noter comme X-009, plus les carrés de contrôle"
    detail: "À battre : F1 0,776 sur les quatre régions, au-delà de 0,03 d'écart. Le F1 ne regarde que le voisinage des lettres : c'est le chiffre des carrés de contrôle qui dira si le fond gris recule."
---

Fait quand nous savons si ajouter du papyrus vierge à la zone de supervision change la note sur les régions mises de côté et la réponse du modèle sur du papyrus vierge jamais vu. Quatrième point de l'ordre d'essai de `docs/veille-optimisations.md`.

Deux réserves notées au départ. Désigner du papyrus vierge est un jugement humain, et une erreur apprend au modèle à effacer de l'encre. Et le F1 de X-009 ne suffit pas à juger cet essai : il ne porte que sur des pixels proches des lettres.
