---
id: T-002
titre: "Cloner villa et installer la chaîne d'encre"
statut: faite
piste: P-310
priorite: 1
responsable: "Agent C."
echeance: null
issue: null
creee: 2026-11-14
etapes:
  - date: 2026-11-14
    genre: etape
    statut: faite
    titre: Cloner villa
    detail: Dépôt `ScrollPrize/villa`, au commit `2d3fb38`.
  - date: 2026-11-14
    genre: bug
    statut: corrige
    titre: "La compilation s'arrête : bibliothèques absentes"
    detail: "`uv sync --extra models` compile un module C++ qui réclame SQLite3, Ceres et Boost. Corrigé en lançant `volume-cartographer/scripts/install_build_deps.sh minimal-build`, plus le paquet `libboost-dev`."
  - date: 2026-11-14
    genre: bug
    statut: corrige
    titre: Le téléchargement des dépendances expire
    detail: Délai réseau dépassé sur les gros paquets. Corrigé avec `UV_HTTP_TIMEOUT=900` et `UV_CONCURRENT_DOWNLOADS=3`.
  - date: 2026-11-14
    genre: bug
    statut: corrige
    titre: La compilation est tuée faute de mémoire vive
    detail: 27 compilateurs lancés en parallèle sur 6,8 Go. Corrigé avec `CMAKE_BUILD_PARALLEL_LEVEL=2`.
  - date: 2026-11-14
    genre: etape
    statut: faite
    titre: Installer l'environnement d'encre
    detail: Réussi au quatrième essai. `torch 2.12.1+cu130`, CUDA actif. La commande est `scripts/wsl/installer-villa.sh` ; les trois obstacles sont décrits dans P-410.
---

Dans WSL : cloner ScrollPrize/villa, puis `uv sync --extra models` dans `villa/vesuvius`. Fait quand PyTorch voit la carte graphique.

**2026-11-14** : fait au quatrième essai. `torch 2.12.1+cu130`, CUDA actif, RTX 3080 Laptop reconnue. villa au commit `2d3fb38`. La commande est `scripts/wsl/installer-villa.sh` ; les trois obstacles rencontrés sont décrits dans P-410.
