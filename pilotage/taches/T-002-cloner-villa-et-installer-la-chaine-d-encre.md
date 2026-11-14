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
---

Dans WSL : cloner ScrollPrize/villa, puis `uv sync --extra models` dans `villa/vesuvius`. Fait quand PyTorch voit la carte graphique.

**2026-11-14** : fait au quatrième essai. `torch 2.12.1+cu130`, CUDA actif, RTX 3080 Laptop reconnue. villa au commit `2d3fb38`. La commande est `scripts/wsl/installer-villa.sh` ; les trois obstacles rencontrés sont décrits dans P-410.
