---
id: T-016
titre: "Réentraîner avec une zone de validation"
statut: en-cours
piste: P-310
priorite: 1
responsable: "Agent C."
echeance: null
issue: null
creee: 2026-11-16
etapes:
  - date: 2026-11-16
    genre: etape
    statut: faite
    titre: "Lire le harnais de validation de khj1222"
    detail: "Trois outils et leur documentation, au commit c876e01, licence MIT. Notre installation de villa sait déjà noter sur un masque de validation, choisir le meilleur point de sauvegarde et convertir le masque : il ne manquait que le masque lui-même."
  - date: 2026-11-16
    genre: etape
    statut: faite
    titre: "Planifier le découpage à blanc sur notre segment"
    detail: "15 régions annotées, 13 groupes. Régions mises de côté : 2, 13, 14 et 15, soit 20,0 % de la surface annotée, densité d'encre 0,2283 des deux côtés. C'est le découpage que documente l'auteur."
  - date: 2026-11-16
    genre: etape
    statut: faite
    titre: "Entraîner sans les régions mises de côté (X-008)"
    detail: "Réglage de X-002, plus la notation sur cinquante lots toutes les 500 itérations et le choix du meilleur point de sauvegarde. 2 h 19 min sans arrêt. villa garde l'itération 17 500 (justesse équilibrée 0,816) ; la note reste à 0,50 jusqu'à l'itération 10 000."
  - date: 2026-11-17
    genre: bug
    statut: ouvert
    titre: "La note de villa est trop bruitée pour choisir un point de sauvegarde"
    detail: "Deux notes voisines diffèrent jusqu'à 0,11 : chacune porte sur cinquante lots tirés au hasard, pas les mêmes d'une fois à l'autre. L'étape suivante note sur les régions entières."
  - date: 2026-11-17
    genre: etape
    statut: a-faire
    titre: "Noter chaque point de sauvegarde sur les régions entières"
    detail: "Prédire dans les seules régions mises de côté (`--mask-path`, `--no-compile`) et mesurer F1 à tous les seuils, à la manière de `sweep_checkpoints.py` et `eval_validation.py`. Leurs appels visent un ancien nom du paquet de villa : à adapter, en citant l'auteur."
---

Fait quand nous avons un modèle entraîné sans les régions mises de côté, sa note sur ces régions, et le point de sauvegarde à garder. Deuxième point de l'ordre d'essai de `docs/veille-optimisations.md`, accepté par Kanemonium le 2026-11-16.
