---
id: D-007
titre: "L'outil s'appelle Hephaist'OS, et il montre ce qu'on exécute"
type: decision
domaine: pilotage
statut: validee
parent: P-510
date: 2026-11-15
---

## Constat

L'IHM portait le nom d'Agent C., qui est l'assistant et non l'outil. Et après deux heures d'entraînement, rien dans l'IHM ne disait ce qui avait été produit, ni ce que valait le résultat.

## Réflexions

- **Kanemonium** (2026-11-15) : renommer l'application Hephaist'OS, avec le logo qu'il fournit. Le Cap n'est plus un onglet : c'est l'accueil, derrière le logo. Les cartes ont un liseré gauche plat, arrondies à droite seulement. Cliquer une tâche fait glisser le tableau vers la gauche et montre son détail, avec ses sous-tâches et ses bugs. Un nouvel onglet rend les exécutions : le code utile, les sorties du modèle, et des annotations pour comprendre le code. Les notions du code vont dans la documentation, reliées à leur exécution.
- **Agent C.** (2026-11-15) : trois choix de mise en œuvre. Le parcours d'une tâche s'écrit dans son fichier (clé `etapes`), pour rester dans le carnet. Le code montré dans un rendu est relu dans le dépôt à chaque affichage, il ne peut donc pas diverger de ce qui a tourné. Les extraits de villa sont cités avec leur commit et leur lien ; villa est sous licence MIT.
- **Kanemonium** (2026-11-15) : avant de pousser, une exécution doit avoir sa page avant d'être lancée, une barre de progression pendant qu'elle tourne, ses journaux en temps réel si possible, puis ses résultats et ses journaux historisés. La barre et le bouton du journal vont dans la carte de gauche ; le bouton porte une petite onde pendant l'exécution et devient vert à la fin.
- **Agent C.** (2026-11-15) : fait. Un lanceur unique (`scripts/wsl/lancer-execution.sh`) écrit l'état et le journal ; l'IHM lit la progression dans les barres du journal. Vérifié par un essai à blanc avec un programme factice, pas encore sur une vraie exécution. Les journaux de X-001 et X-002 ont été condensés et rangés dans le dépôt (12 Ko au lieu de 1,8 Mo pour X-002). La page de X-003, la prédiction, est écrite ; elle n'est pas lancée.

## Suite

T-010. Format dans `pilotage/README.md`, composants dans `docs/design-system.md`. Le branchement de Discord dans l'outil est la suite annoncée (T-007).
