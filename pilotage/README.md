# Pilotage

Le carnet de recherche. C'est la **source de vérité** : l'IHM ne fait que le lire
(et modifier le statut d'une tâche). Tout est du texte, versionné avec le code.

```
pilotage/
├── pistes/     une piste, un domaine ou une décision par fichier   → la carte
├── taches/     une tâche par fichier                               → le tableau
├── horizon.yaml  livrables projetés, problèmes anticipés, échéances → l'horizon
└── boite.md    messages laissés à Agent C. depuis l'IHM
```

## Une piste (`pistes/P-310-….md`)

```markdown
---
id: P-310                 # P-… piste ou domaine, D-… décision. Unique.
titre: "Ligne de base : le tutoriel d'encre"
type: piste               # racine | domaine | piste | decision
domaine: encre            # defi | scan | depliage | encre | outils | pilotage
statut: en-cours          # a-explorer | en-cours | validee | impasse
parent: P-300             # id de la piste parente (null pour la racine)
date: 2026-11-14
source: https://…         # facultatif
prix: [first-letters]     # facultatif
---

## Constat
Ce qu'on observe.

## Cause racine
Pourquoi. « Inconnue » ou « à mesurer » sont des réponses valables.

## Réflexions
- **Kanemonium** (2026-11-14) : …
- **Agent C.** (2026-11-14) : …

## Suite
Ce qu'on fait ensuite, avec les identifiants des tâches.
```

Une piste abandonnée n'est jamais supprimée : elle passe à `impasse` et sa section
« Cause racine » dit pourquoi. C'est ce qui évite de la réexplorer.

## Une tâche (`taches/T-001-….md`)

```markdown
---
id: T-001
titre: "Installer Ubuntu sous WSL2 et vérifier CUDA"
statut: a-faire           # a-faire | en-cours | bloquee | faite
piste: P-310              # la piste (ou décision) que la tâche sert
priorite: 1               # 1 (d'abord) à 3
responsable: "Agent C."
echeance: null            # ou AAAA-MM-JJ
issue: null               # numéro de l'issue GitHub liée, s'il y en a une
creee: 2026-11-14
---

Note libre : ce qui définit « fait ».
```

## Liens

Dans n'importe quel texte, un identifiant (`P-310`, `D-001`, `T-004`, `L-02`) devient
un lien dans l'IHM. Le script `npm run verifier` refuse un identifiant de parent, de
piste ou de livrable qui n'existe pas ; la CI le lance à chaque envoi.
