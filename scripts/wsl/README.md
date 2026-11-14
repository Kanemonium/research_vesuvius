# Ubuntu sous WSL2

Le code de recherche tourne sous Ubuntu (WSL2), comme le demande le tutoriel du défi.

```powershell
wsl --install -d Ubuntu-24.04 --no-launch
wsl -d Ubuntu-24.04 -u root -- bash scripts/wsl/preparer.sh
wsl --terminate Ubuntu-24.04
wsl -d Ubuntu-24.04 -- bash scripts/wsl/etat.sh
```

- `preparer.sh` crée un utilisateur ordinaire (sudo sans mot de passe), installe le compilateur, git et `uv`.
- `etat.sh` affiche la version du système, la carte graphique vue depuis Ubuntu, la mémoire et les outils présents.

Relevé du 2026-11-14 sur la machine du projet : Ubuntu 24.04.5, RTX 3080 Laptop (8 Go, dont
environ 1,9 Go déjà pris par Windows), 16 cœurs, 6 Go de mémoire accordés à WSL par défaut.
