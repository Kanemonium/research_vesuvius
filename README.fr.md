# research_vesuvius

Carnet de recherche ouvert et outillage pour le [Vesuvius Challenge](https://scrollprize.org) :
lire les rouleaux carbonisés d'Herculanum sans les ouvrir.

Ce dépôt est travaillé à découvert dès le premier jour. Il contient trois choses :

| Dossier | Contenu |
|---|---|
| [`pilotage/`](pilotage/) | La trace de la recherche : chaque piste explorée, pourquoi, ce qui l'a bloquée, ce qui a été décidé. Du Markdown et du YAML, versionnés avec le code. |
| [`src/vesuvius_lab/`](src/vesuvius_lab/), [`experiments/`](experiments/) | Le code de recherche et un dossier par expérience (configuration, commande, résultat). |
| [`ihm/`](ihm/) | Un poste de pilotage local (« Agent C. ») qui lit `pilotage/` et l'activité GitHub, et les montre sous forme de carte, de tableau de tâches et d'horizon. |

## État

Premier jour. Aucun modèle n'a été entraîné et aucun résultat n'est revendiqué.
La prochaine étape est le tutoriel officiel de détection d'encre sur un segment de PHerc. Paris. 4.

## Lancer l'IHM

Node.js 22 ou plus récent.

```bash
npm ci
npm run ihm
```

Puis ouvrir <http://127.0.0.1:4173>. Le panneau GitHub demande un jeton dans `.env`
(voir [`.env.example`](.env.example)) ; le reste fonctionne sans.

## Pour aller plus loin

- [`docs/defi.md`](docs/defi.md) : le défi, les prix et les règles que nous suivons.
- [`docs/architecture.md`](docs/architecture.md) : l'organisation du dépôt et la CI.
- [`docs/design-system.md`](docs/design-system.md) : le design système de l'IHM.
- [`pilotage/README.md`](pilotage/README.md) : le format des pistes, des tâches et de l'horizon.

## Licence

Code et documentation sous [licence MIT](LICENSE). Les données des rouleaux ne sont pas
dans ce dépôt et restent soumises aux conditions du Vesuvius Challenge.
