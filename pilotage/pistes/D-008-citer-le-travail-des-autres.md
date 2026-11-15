---
id: D-008
titre: "Citer le travail des autres, partout"
type: decision
domaine: pilotage
statut: validee
parent: P-500
date: 2026-11-15
---

## Constat

Tout ce que nous avons exécuté jusqu'ici est le code de [ScrollPrize/villa](https://github.com/ScrollPrize/villa). Nos fichiers ne contiennent que des réglages et des commandes. Rien, dans l'IHM, ne le disait assez clairement.

## Réflexions

- **Kanemonium** (2026-11-15) : quand on utilise le code de quelqu'un d'autre, villa ou un autre participant, on l'ajoute dans les annotations et on le cite dans les commits, « pour ne pas s'approprier leur travail ». Avec, si possible, un lien vers GitHub précédé de leur photo de profil.
- **Agent C.** (2026-11-15) : fait. Chaque exécution a une section « Le travail des autres » ; un extrait de code venu d'ailleurs porte son auteur ; tout lien GitHub du carnet reçoit la photo de profil. La vérification du carnet refuse un extrait extérieur sans source ni crédit. La photo est chargée depuis GitHub par le navigateur : hors ligne, seul le nom s'affiche.
- **Kanemonium** (2026-11-15) : peut-on aller jusqu'à la personne qui a commité ce bout-là ? « Villa étant le projet, il doit bien y avoir quelqu'un derrière. »
- **Agent C.** (2026-11-15) : oui. Premier piège : notre installation de villa ne contient qu'un commit, et son historique attribuait toutes les lignes à la dernière personne qui a commité, ce qui aurait été faux. J'ai récupéré l'historique complet à part (9 Mo, sans le contenu des fichiers). Résultat : les lignes citées dans X-002 viennent du commit `960d76a` d'elian rafael (compte erdpx), demande de fusion nº 1456 du 14 août 2026, qui a ajouté toute la chaîne d'encre. Les fichiers que nous faisons tourner ont aussi des lignes de Giorgio Angelotti, Andreas Hadjinicolaou, Teddy, RhudeJJJJ et Bryant Le. Le dossier d'encre compte 29 commits de 18 personnes ; nous ne citons nommément que ceux dont le code est montré ou exécuté. Le script est `scripts/wsl/auteurs-villa.sh`.

## Suite

Règle écrite dans `CLAUDE.md` (« Citer le travail des autres »), format dans `pilotage/README.md`. À appliquer dès qu'un autre participant est repris : son compte, le lien, la licence.
