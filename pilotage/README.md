# Pilotage

Le carnet de recherche. C'est la **source de vérité** : l'IHM ne fait que le lire
(et modifier le statut d'une tâche). Tout est du texte, versionné avec le code.

```
pilotage/
├── pistes/     une piste, un domaine ou une décision par fichier   → la carte
├── taches/     une tâche par fichier                               → le tableau
├── horizon.yaml  livrables projetés, problèmes anticipés, échéances → l'horizon
└── boite.md    messages laissés à Agent C. depuis l'IHM

experiments/<date>-<sujet>/execution.yaml   rendus d'exécution    → l'onglet Exécutions
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
etapes:                   # facultatif : le parcours de la tâche, dans l'ordre où il s'est passé
  - date: 2026-11-14
    genre: etape          # etape | bug
    statut: faite         # étape : a-faire | en-cours | faite ; bug : ouvert | contourne | corrige
    titre: "Installer Ubuntu 24.04"
    detail: "Ce qui a été fait, ou la cause du bug et sa correction."
---

Note libre : ce qui définit « fait ».
```

Dans l'IHM, cliquer une carte du tableau fait glisser le tableau et montre ce parcours.
Un bug n'est `corrige` que si sa cause a été retirée ; `contourne` dit qu'on a fait autrement.

## Une exécution (`experiments/<dossier>/execution.yaml`)

Un rendu par exécution réellement lancée : le code utile, sa lecture, ce qui en est sorti.
Un fichier peut en décrire plusieurs, sous la clé `executions`.

```yaml
executions:
  - id: X-002               # unique
    titre: "Entraînement complet de la ligne de base"
    date: 2026-11-14
    statut: terminee        # prevue | en-cours | terminee | echouee
    piste: P-420
    taches: [T-004]
    resume: "Une phrase ou deux."
    bilan:                  # ce que l'exécution a produit, en trois ou quatre réponses courtes
      - question: "Le type de résultat"
        valeur: "Un fichier de poids"
        detail: "Markdown."
        fiches: [K-15]
    code:                   # le code utile, annoté
      - titre: "Le réglage"
        fichier: experiments/…/config.json   # relu dans le dépôt (experiments/, scripts/ ou src/)
        extrait: [11, 22]                    # facultatif : lignes à montrer
        # ou, pour du code qui n'est pas dans le dépôt : texte: |, debut: 1022, origine:, source: (lien),
        # auteur: ScrollPrize (compte GitHub) — obligatoire avec « source », pour citer qui l'a écrit
        # auteurs: [{ github: erdpx, nom: "…", commit: <sha complet>, pr: 1456, date: 2026-08-14 }]
        #   la ou les personnes qui ont écrit ces lignes, relevées par scripts/wsl/auteurs-villa.sh
        notes:
          - lignes: [15, 16]                 # numéros de ligne du fichier
            genre: parametrage               # parametrage | architecture | optimisation | donnees | mesure
            titre: "Deux blocs à la fois"
            texte: "Markdown."
            fiches: [K-13]
    sorties:
      - { genre: mesures, titre: "…", lignes: [["Durée", "1 h 53", "remarque"]] }
      - { genre: courbe, titre: "…", x: "itération", y: "perte", points: [[1000, 0.51]] }
      - { genre: journal, titre: "…", texte: "extrait du journal" }
      - { genre: fichiers, titre: "…", lieu: "…", elements: [{ nom: "…", taille: "…", role: "…" }] }
    limites: "Markdown : ce que l'exécution ne dit pas."
    credits:                # le travail des autres sur lequel l'exécution s'appuie
      - github: ScrollPrize          # compte ou organisation GitHub : donne la photo de profil
        nom: "ScrollPrize/villa"
        lien: https://github.com/ScrollPrize/villa
        licence: MIT
        quoi: "Ce qui vient d'eux."
        personnes:                   # facultatif : qui, dans ce projet, a écrit ce que nous faisons tourner
          - { github: erdpx, nom: "…", part: "1 122 lignes de train.py" }
```

Partout dans le carnet, un lien Markdown vers `https://github.com/<compte>/…` s'affiche dans
l'IHM précédé de la photo de profil du compte. C'est la façon de citer quelqu'un.

### La vie d'une exécution

1. **Avant de lancer** : écrire sa page, `statut: prevue`, avec ce qu'on sait déjà (ce qu'elle doit
   produire, le code annoté, ce qu'elle ne dira pas). Pas de `sorties` : rien n'est mesuré.
2. **Lancer** par `scripts/wsl/lancer-execution.sh <X-…> <dossier de l'expérience> <commande…>`.
   Le lanceur écrit dans `experiments/<dossier>/journaux/` :
   `X-….etat.json` (début, puis fin, code de sortie, pic de mémoire vidéo) et `X-….brut.log`
   (tout ce que le programme affiche). L'IHM en tire la barre de progression et le journal en direct.
3. **À la fin** : le lanceur condense le journal dans `X-….log` (une ligne de progression par
   pour-cent). Compléter la page : `statut: terminee` ou `echouee`, le `bilan` réécrit avec ce qui a
   été mesuré, les `sorties`. Le journal condensé et le fichier d'état sont versionnés ; le brut ne l'est pas.

### Pause, arrêt et reprise

- **Pause** : les boutons « Pause » et « Reprendre » de la carte gèlent puis relancent le programme
  (`scripts/wsl/signaler-execution.sh`). Rien n'est perdu, mais la pause ne survit pas à un
  redémarrage de la machine ou d'Ubuntu.
- **Reprise après un arrêt** : relancer la même commande. Le lanceur reconnaît une exécution
  commencée et non terminée : il garde l'heure du premier début, compte la reprise et continue le
  même journal. C'est la commande qui saute ce qui est déjà fait :
  `predire-par-bandes.sh` pour une prédiction (une bande finie est gardée),
  `reprendre-entrainement.sh` pour un entraînement (dernier point de sauvegarde).
- **Étapes** : une commande en plusieurs étapes écrit « k n libellé » dans le fichier
  `$EXECUTION_ETAPE` ; l'IHM affiche « libellé k/n » et l'avancement de l'ensemble.

L'état montré dans l'IHM est celui du lanceur quand il existe, sinon le `statut` de la page.
La barre de progression se lit dans les barres « tqdm » du journal ; un programme qui n'en
affiche pas est suivi sans pourcentage.

Une fiche citée par une exécution affiche en retour le lien vers cette exécution.
Aucune donnée ni aucun poids dans ces fichiers : seulement des chiffres relevés et des extraits de journal.

## Les avancées d'un domaine (`avancees/<domaine>.yaml`)

Un fichier par domaine de la carte. Il alimente le « parcours » qui s'ouvre quand on clique la bande d'un domaine : un graphe vertical, du plus ancien au plus récent.

- `domaine`, `portee` (`communaute` : le défi tout entier ; `nous` : notre seul travail), `lu_le`, `resume` (Markdown).
- `avancees` : une liste de nœuds `A-…` avec `date` (`AAAA`, `AAAA-MM` ou `AAAA-MM-JJ`, ou `null` si la source ne la donne pas), `note_date`, `titre`, `statut` (`acquis`, `en-cours`, `ouvert`), `resume`, `fonctionnel`, `technique`, `qui`, `prix` (`nom`, `montant`), `sources` (`titre`, `lien`), `fiches`, `pistes`, `executions`, et `nous: true` pour un pas à nous dans un parcours du défi.
- Une avancée de la communauté sans source est refusée par `npm run verifier`.
- `scan`, `depliage` et `encre` sont écrits par `scripts/avancees-depuis-releve.mjs` à partir d'un relevé des pages de scrollprize.org, dont chaque citation est revérifiée mot pour mot. Ne pas les retoucher à la main : corriger le relevé ou le script, puis relancer. `pilotage` et `outils` sont tenus à la main.

## Liens

Dans n'importe quel texte, un identifiant (`P-310`, `D-001`, `T-004`, `X-002`, `L-02`, `K-08`) devient
un lien dans l'IHM. Le script `npm run verifier` refuse un identifiant de parent, de
piste, de tâche, de fiche ou de livrable qui n'existe pas ; la CI le lance à chaque envoi.
