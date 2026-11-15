---
id: D-010
titre: "Discord : lire à la demande, garder les messages sur la machine, relire avant d'envoyer"
type: decision
domaine: outils
statut: validee
parent: P-400
date: 2026-11-15
---

## Constat

Les échanges utiles du défi passent par son serveur Discord, en anglais. Kanemonium veut les suivre en français depuis Hephaist'OS (synthèse, mentions, actualité), et y répondre.

## Cause racine

Le serveur ne nous appartient pas. Un robot officiel ne peut y entrer que sur invitation de l'équipe du défi, et automatiser un compte personnel est interdit par Discord.

## Réflexions

- **Agent C.** (2026-11-15) : trois voies. Un robot en lecture seule, à demander à l'équipe. L'automatisation du compte, écartée. La lecture à la demande, dans le navigateur de la séance où Kanemonium est connecté.
- **Kanemonium** (2026-11-15) : d'accord pour la lecture à la demande ; il doute que l'équipe accepte un robot, la recherche en cours ayant des enjeux. Rythme voulu : deux ou trois lectures par jour au plus, une demande laissée dans la boîte du carnet, ses retours une fois par jour ; au-delà de huit heures sans lecture, l'IHM le signale.
- **Agent C.** (2026-11-15) : la connexion à Discord reste l'affaire de Kanemonium. Si elle expire, c'est lui qui se reconnecte ; Agent C. ne saisit jamais de mot de passe.

## Décision

- Agent C. lit les salons du défi à la demande, au rythme d'un lecteur humain, jamais en tâche de fond. Il ne lit pas les autres serveurs du compte.
- Ce qui est lu est traduit, résumé et rangé dans `local/discord/lecture.json`, ignoré par git. Aucun message d'autrui n'entre dans le dépôt public ; une idée reprise dans le carnet est reformulée et attribuée à son auteur.
- Les réponses sont rédigées en anglais par Agent C., relues par Kanemonium, et ne partent qu'avec son accord, message par message. Elles apparaissent dans le tiroir, à leur date.
- Le tiroir de l'IHM ne parle jamais à Discord : il montre ce fichier.
- L'actualité publique de GitHub (issues et demandes de fusion de villa) y entre par la même voie : relevée par `scripts/villa-actu.mjs` au moment d'une lecture, traduite, puis rangée dans le même fichier.
- **Kanemonium** (2026-11-15) : tout ce que nous proposons dans un dépôt du défi ou d'un participant suit les règles de contribution de villa, résumées dans `docs/contribuer-a-villa.md`.

## Suite

T-012. Première lecture faite le 2026-11-15 (annonces, forum d'encre, salon de déroulement). Deux points à suivre : les règles de contribution de [ScrollPrize/villa](https://github.com/ScrollPrize/villa) à lire avant toute proposition (P-410), et la proposition publique [villa #2521](https://github.com/ScrollPrize/villa/pull/2521) sur la vitesse de prédiction, à vérifier chez nous après X-003. L'envoi d'un message reste à roder sur un serveur de test.
