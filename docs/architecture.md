# Architecture du dépôt

## Vue d'ensemble

```
research_vesuvius/
├── README.md · README.fr.md   présentation (anglais pour la communauté, français pour nous)
├── LICENSE                    MIT
├── CONTRIBUTING.md            règles de contribution
├── CLAUDE.md                  contexte durable d'Agent C.
├── .env.example               modèle des secrets (le vrai .env n'est jamais versionné)
│
├── pilotage/                  LE CARNET — source de vérité de la recherche
│   ├── pistes/                carte : pistes, domaines, décisions
│   ├── taches/                gestion de projet
│   ├── horizon.yaml           livrables projetés, problèmes anticipés, échéances
│   └── boite.md               messages laissés à Agent C. depuis l'IHM
│
├── ihm/                       LE POSTE DE PILOTAGE — lit le carnet et GitHub
│   ├── server.mjs             serveur local (127.0.0.1), garde le jeton
│   ├── lib/                   lecture/validation du carnet, appels GitHub
│   └── public/                page, styles (design système), une vue par fichier
│
├── src/vesuvius_lab/          LE CODE DE RECHERCHE (Python, vide au premier jour)
├── experiments/               une expérience = un dossier daté, reproductible
├── tests/                     tests Node (carnet) et Python (recherche)
├── scripts/                   vérification du carnet
├── docs/                      défi, architecture, design système
├── .github/                   CI et modèle de demande de fusion
│
├── data/                      (ignoré) données téléchargées
└── models/                    (ignoré) poids de modèles
```

## Les trois principes

1. **Le carnet est du texte versionné.** Pistes, tâches et projections vivent dans `pilotage/`,
   pas dans une base de données ni dans un outil externe. Le raisonnement est donc public,
   daté, et relu par les mêmes contrôles que le code.
2. **L'IHM ne possède rien.** Elle lit le carnet et l'activité GitHub. Ses deux seules écritures
   sont le statut d'une tâche et un message dans la boîte. Si l'IHM disparaît, rien n'est perdu.
3. **Rien de lourd, rien de secret dans git.** Les données et les poids restent dans `data/` et
   `models/`, ignorés. Chaque expérience consigne la commande qui récupère ses entrées.

## Critères open source, et où ils sont tenus

| Critère du défi | Réponse dans ce dépôt |
|---|---|
| Licence permissive | `LICENSE` (MIT) |
| Publié tôt | dépôt ouvert dès le premier jour, carnet compris |
| Documenté | `README`, `docs/`, un `README` par expérience |
| Reproductible | commandes de téléchargement et d'exécution consignées, dépendances verrouillées |
| Résultats mesurés sur les données publiques | consignés dans `experiments/`, y compris les résultats négatifs |
| Poids et données d'entraînement publiés quand c'est pertinent | sur Hugging Face, liés depuis l'expérience (rien dans git) |

## Intégration continue (`.github/workflows/ci.yml`)

À chaque envoi sur `main` et à chaque demande de fusion, trois contrôles indépendants :

| Contrôle | Ce qu'il vérifie |
|---|---|
| **Pilotage et IHM** | `npm run verifier` (identifiants uniques, liens entre pistes, tâches et livrables, statuts valides) puis `npm test` |
| **Code de recherche** | `ruff check` (style et erreurs) puis `pytest` |
| **Secrets** | `gitleaks` parcourt tout l'historique à la recherche d'un jeton oublié |

Pas encore de déploiement continu : il n'y a rien à déployer. Les étapes prévues, quand elles
auront un objet : publication des poids sur Hugging Face à chaque version étiquetée, et
publication d'une version en lecture seule de la carte sur GitHub Pages.

## L'IHM en bref

- **Sans compilation.** Modules JavaScript natifs, deux dépendances côté serveur (`yaml`, `marked`).
- **Locale.** Le serveur n'écoute que sur `127.0.0.1` et refuse les écritures venues d'une autre origine.
- **Le jeton GitHub ne quitte pas le serveur** : la page reçoit des données déjà filtrées.
- **Navigation par adresse** : `#/carte?id=P-310`, `#/taches?id=T-004`, `#/horizon?id=L-02`.
  Tout identifiant cité dans un texte du carnet devient un lien vers la bonne vue.
