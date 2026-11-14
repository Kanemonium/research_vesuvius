---
id: D-003
titre: "IHM sans compilation, jeton côté serveur"
type: decision
domaine: pilotage
statut: validee
parent: P-510
date: 2026-11-14
---

## Constat

Node.js est installé sur la machine, Python n'y est disponible que partiellement.

## Réflexions

- **Agent C.** (2026-11-14) : un petit serveur Node et une page sans étape de compilation, avec deux dépendances seulement. Le jeton GitHub reste dans le serveur local et n'atteint jamais le navigateur.
