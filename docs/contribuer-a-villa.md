# Contribuer à villa : les règles de l'équipe du défi

Résumé en français des règles de contribution de [ScrollPrize/villa](https://github.com/ScrollPrize/villa),
lues au commit [`2d3fb38`](https://github.com/ScrollPrize/villa/tree/2d3fb38d33a18b257230c0bd23986436c3d4722e) le 2026-11-15.
Sources : [`CONTRIBUTING.md`](https://github.com/ScrollPrize/villa/blob/2d3fb38d33a18b257230c0bd23986436c3d4722e/CONTRIBUTING.md),
[modèle de demande de fusion](https://github.com/ScrollPrize/villa/blob/2d3fb38d33a18b257230c0bd23986436c3d4722e/.github/pull_request_template.md)
et [`AGENTS.md`](https://github.com/ScrollPrize/villa/blob/2d3fb38d33a18b257230c0bd23986436c3d4722e/AGENTS.md), licence MIT.
C'est un résumé : en cas de doute, le texte anglais fait foi. À relire quand villa change.

Ces règles valent pour tout ce que nous proposons à villa, à un autre dépôt du défi ou au dépôt
d'un participant : demande de fusion (pull request), issue, commentaire.

## Ce que l'équipe veut recevoir

- Une proposition qui touche une partie **réellement utilisée** du code, par l'équipe ou la communauté.
- Une fonction ou un confort qui améliore vraiment l'usage de VC3D ou des scripts.
- Des exemples avant et après **sur de vraies données de rouleau**, en chiffres et en images.
- Pour l'encre ou la segmentation : une comparaison avec la meilleure méthode du moment.
- Un vrai défaut, rencontré par quelqu'un en travaillant sur un rouleau.

## Les règles

1. **Née de l'usage.** La proposition vient de ce qu'on a fait tourner l'outil sur de vraies données, pour un but du défi. L'équipe ne maintient que ce que des humains utilisent.
2. **Un correctif a sa preuve.** Une capture de l'erreur, puis l'outil qui tourne sans erreur après.
3. **De vraies données.** Les exemples synthétiques ou jouets sont refusés.
4. **Une motivation.** Dire ce qu'on essayait de faire quand le problème est apparu.
5. **Des images ou vidéos comparées** aux méthodes actuelles, quand cela s'applique.
6. **Suivre les modèles** de demande de fusion et d'issue, et poser une étiquette si possible.

## Si une IA a aidé

L'équipe accepte les assistants de code et s'en sert elle-même. Mais relire prend du temps sur les rouleaux :

- La proposition vient d'un **humain qui a utilisé le code** pour travailler sur les données.
- Toute proposition générée par une IA est accompagnée d'un **commentaire écrit par l'humain**, qui explique pourquoi elle est utile.
- La description est **courte et sans jargon**.
- L'utilité se mesure sur de vraies données.
- L'auteur a **relu le code lui-même**, pour sa simplicité et son exactitude.
- Les « parties de pêche » (demander à une IA de chercher des défauts dans le code, sans usage réel) peuvent être fermées.

## Le modèle de demande de fusion

Dans cet ordre : **en une phrase** (ce qu'on peut faire avec, pas une liste de fonctions) ; **un exemple réel**
(avec telle donnée, j'ai fait ceci, cela a produit cela) ; **avant** ; **après** ; **la preuve** (image, vidéo,
sortie ou mesure, mêmes entrées et mêmes réglages, en disant quoi regarder) ; **pourquoi et pour qui**.
Puis une case à cocher : « j'ai vérifié moi-même que l'exemple et la preuve viennent de cette proposition, sur
les données indiquées ». Les détails (méthode, commit testé, commandes, limites) viennent après.

## Ce que villa demande aux agents

- Trouver d'abord le sous-projet concerné ; ne rien installer ni compiler sans demande explicite.
- Le plus petit changement qui résout le problème ; pas de grand remaniement non demandé.
- Ne pas changer les résultats numériques sans le dire : ni précision réduite, ni ordre de calcul modifié en silence.
- Un travail de vitesse se mesure : référence, commande, données, résultats avant et après.
- Le code doit tourner sous Ubuntu et macOS.
- Lancer les tests avant d'annoncer un succès ; ajouter un test minimal s'il n'en existe pas.
- Avant d'écrire du code qui lit des données du défi, regarder ce que `vc_reader` sait déjà faire.
- Ne pas y verser de plans, de rapports ni de journaux d'essai.

## Entendu sur Discord, non vérifié dans les textes

- Les propositions qui ne suivent pas ces règles peuvent être fermées sans commentaire (annonce de l'équipe, août 2026).
- Il y aurait une limite de trois demandes de fusion ouvertes par personne (dit par un participant).

## Ce que cela veut dire pour nous

- **Kanemonium est l'humain.** C'est lui qui a rencontré le problème, qui écrit la motivation avec ses mots (Agent C. la traduit), qui relit et qui coche la case.
- **Une chose à la fois**, petite, avec sa preuve produite sur notre machine et gardée dans une exécution `X-…`.
- **Dire l'aide reçue** : une ligne signale qu'Agent C. (Claude) a aidé à écrire.
- **Rien ne part sans l'accord de Kanemonium.**
