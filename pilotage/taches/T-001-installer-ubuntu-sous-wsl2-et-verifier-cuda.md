---
id: T-001
titre: "Installer Ubuntu sous WSL2 et vérifier CUDA"
statut: faite
piste: P-310
priorite: 1
responsable: "Kanemonium + Agent C."
echeance: null
issue: null
creee: 2026-11-14
etapes:
  - date: 2026-11-14
    genre: etape
    statut: faite
    titre: Constater l'état de départ
    detail: WSL 2 est présent, mais la seule distribution installée est celle de Docker Desktop.
  - date: 2026-11-14
    genre: etape
    statut: faite
    titre: Installer Ubuntu 24.04
    detail: Utilisateur `kanemonium`, `uv` 0.13.8. Les commandes sont dans `scripts/wsl/preparer.sh`.
  - date: 2026-11-14
    genre: etape
    statut: faite
    titre: Vérifier la carte graphique
    detail: "`nvidia-smi` répond depuis Ubuntu : RTX 3080 Laptop, 8 Go."
---

WSL 2 est présent, mais la seule distribution installée est celle de Docker Desktop. Fait quand `nvidia-smi` répond depuis Ubuntu.

**2026-11-14** : fait. Ubuntu 24.04.5 installé, `nvidia-smi` répond depuis Ubuntu (RTX 3080 Laptop, 8 Go). Utilisateur `kanemonium`, `uv` 0.13.8. Les commandes sont dans `scripts/wsl/`.
