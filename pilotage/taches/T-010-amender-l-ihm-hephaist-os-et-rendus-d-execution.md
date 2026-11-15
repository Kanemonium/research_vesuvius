---
id: T-010
titre: "Amender l'IHM : Hephaist'OS, détail des tâches, rendus d'exécution"
statut: faite
piste: D-007
priorite: 1
responsable: "Agent C."
echeance: null
issue: null
creee: 2026-11-15
etapes:
  - date: 2026-11-15
    genre: etape
    statut: faite
    titre: "Renommer l'outil et poser le logo"
    detail: "Hephaist'OS partout où l'outil était nommé. Le logo fourni par Kanemonium est `ihm/public/logo.png`."
  - date: 2026-11-15
    genre: etape
    statut: faite
    titre: "Faire du Cap l'accueil, derrière le logo"
    detail: "Il reste six onglets : Carte, Tâches, Exécutions, GitHub, Horizon, Doc."
  - date: 2026-11-15
    genre: etape
    statut: faite
    titre: "Cartes à liseré gauche plat"
    detail: "Arrondis sur les coins droits seulement. Le liseré dit le statut."
  - date: 2026-11-15
    genre: etape
    statut: faite
    titre: "Détail d'une tâche, avec ses étapes et ses bugs"
    detail: "Le tableau glisse vers la gauche. Le parcours des tâches T-001 à T-006 a été écrit à partir de ce qui s'est réellement passé."
  - date: 2026-11-15
    genre: bug
    statut: corrige
    titre: "Page blanche au premier essai"
    detail: "Une parenthèse manquante dans `vues/taches.js`. Trouvée avec `node --check`."
  - date: 2026-11-15
    genre: etape
    statut: faite
    titre: "Onglet Exécutions"
    detail: "Rendus X-001 et X-002 : ce qui a été produit, le code annoté, les sorties."
  - date: 2026-11-15
    genre: etape
    statut: faite
    titre: "Fiches des notions du code"
    detail: "K-11 à K-16, reliées aux exécutions dans les deux sens."
  - date: 2026-11-15
    genre: etape
    statut: faite
    titre: "Suivre une exécution en direct"
    detail: "Page écrite avant le lancement, barre de progression et bouton du journal dans la carte, fenêtre du journal, journaux historisés. Essai à blanc réussi avec un programme factice."
  - date: 2026-11-15
    genre: bug
    statut: corrige
    titre: "Le journal n'occupait qu'un tiers de sa fenêtre"
    detail: "Une hauteur maximale héritée du bloc de journal des sorties. Corrigé dans la feuille de style."
---

Fait quand les cinq demandes de Kanemonium du 2026-11-15 sont visibles dans l'IHM et que le carnet et les tests passent. Reste à faire valider par Kanemonium (T-008).
