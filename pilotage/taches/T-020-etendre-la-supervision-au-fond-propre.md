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
    statut: faite
    titre: "Mesurer le modèle actuel sur les carrés de contrôle"
    detail: "X-012, étape 3. Au seuil 176, le point 19 000 de X-008 marque comme encre 3,30 % des deux carrés de contrôle (1,69 % et 4,92 %) et 2,65 % des neuf carrés « fond » (de 0,59 % à 5,87 %)."
  - date: 2026-11-17
    genre: etape
    statut: faite
    titre: "Écrire le masque en version 2 et réentraîner"
    detail: "X-012, 3 h 05 min 51 s. La zone de supervision passe de 95 935 984 à 105 373 168 pixels (9,8 % de plus). L'entraînement va au bout, mais redonne le modèle de X-008 : mêmes notes de validation octet pour octet, même F1 (0,7762 à l'itération 19 000), même réponse sur les carrés."
  - date: 2026-11-17
    genre: bug
    statut: ouvert
    titre: "Aucun bloc d'entraînement n'est tiré dans les carrés de fond"
    detail: "villa ne garde un bloc que si l'encre étiquetée y couvre au moins `patch_min_labeled_coverage` du bloc (0,05 dans notre réglage, repris de X-008). Un carré sans encre ne donne aucun bloc : 11 554 blocs avant comme après. Ce n'est pas un défaut de villa, c'est notre réglage. Nous ne l'avons pas vu avant de lancer : il aurait suffi de compter les blocs."
  - date: 2026-11-17
    genre: etape
    statut: faite
    titre: "Relire ce que le tutoriel dit de cette étape"
    detail: "Question de Kanemonium. Le [tutoriel d'encre](https://scrollprize.org/tutorial5), section « Improving the model: iterative labeling », étend les étiquettes là où des traits de lettres sont bien visibles : il peint les traits et étend le masque de supervision autour, traits et papyrus propre ensemble. Notre essai s'en écarte : il ajoute du papyrus sans aucune encre, loin des lettres. Le tutoriel ne décrit pas ce cas, et le réglage qui écarte les blocs sans encre va dans le même sens. Le tutoriel propose aussi de repartir du dernier point de sauvegarde (`checkpoint` et `weights_only`) plutôt que de zéro : non essayé."
  - date: 2026-11-17
    genre: etape
    statut: faite
    titre: "Compter les blocs avec un réglage qui admet les blocs sans encre"
    detail: "X-013, 1 min 39 s, sans carte graphique. Avec `patch_min_labeled_coverage` à 0 : 22 475 blocs d'entraînement au lieu de 6 567. Les neuf carrés en donnent 2 304 (10,3 %), l'ancienne zone de supervision 13 604 de plus (60,5 %). Un réentraînement ainsi réglé mêlerait deux effets, et le fond propre serait le plus petit."
  - date: 2026-11-17
    genre: etape
    statut: a-faire
    titre: "Kanemonium choisit comment séparer les deux effets"
    detail: "Deux voies. Deux entraînements à 0, l'un avec les étiquettes du tutoriel, l'autre avec la version 2 : environ 4 h 40 et 32 Go. Ou un seul entraînement sur une liste de blocs faite des 6 567 anciens et des 2 304 des carrés, si villa accepte une liste fournie (option `patch_cache_filename` vue dans son code, non essayée)."
  - date: 2026-11-17
    genre: etape
    statut: a-faire
    titre: "Réentraîner pour de bon avec le fond propre"
    detail: "Environ 2 h 20 d'entraînement et 16 Go. Les étiquettes en version 2 et le chiffre d'avant sont déjà là."
  - date: 2026-11-17
    genre: etape
    statut: a-faire
    titre: "Noter comme X-009, plus les carrés de contrôle"
    detail: "À battre : F1 0,776 sur les quatre régions, au-delà de 0,03 d'écart. Le F1 ne regarde que le voisinage des lettres : c'est le chiffre des carrés de contrôle qui dira si le fond gris recule."
---

Fait quand nous savons si ajouter du papyrus vierge à la zone de supervision change la note sur les régions mises de côté et la réponse du modèle sur du papyrus vierge jamais vu. Quatrième point de l'ordre d'essai de `docs/veille-optimisations.md`.

Deux réserves notées au départ. Désigner du papyrus vierge est un jugement humain, et une erreur apprend au modèle à effacer de l'encre. Et le F1 de X-009 ne suffit pas à juger cet essai : il ne porte que sur des pixels proches des lettres.
