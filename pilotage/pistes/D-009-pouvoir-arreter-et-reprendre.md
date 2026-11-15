---
id: D-009
titre: "Toute exécution longue doit pouvoir s'arrêter et reprendre"
type: decision
domaine: outils
statut: validee
parent: P-420
date: 2026-11-15
---

## Constat

La prédiction X-003 est estimée à plusieurs heures, peut-être beaucoup plus. Sur un ordinateur portable qui sert aussi à autre chose, une exécution qu'on ne peut ni suspendre ni reprendre est une exécution qu'on hésite à lancer.

## Cause racine

Le programme de prédiction de [ScrollPrize/villa](https://github.com/ScrollPrize/villa) n'a pas d'option de reprise : arrêté, il repart de zéro. L'entraînement, lui, sait repartir d'un point de sauvegarde.

## Réflexions

- **Kanemonium** (2026-11-15) : « dans ces cas-là, il faudra qu'on mette un système de pause et de reprise en place ».
- **Agent C.** (2026-11-15) : trois niveaux, tous vérifiés dans X-004 sur le vrai programme. Geler le programme depuis l'IHM (rien n'est perdu, mais cela ne survit pas à un redémarrage). Découper la prédiction en bandes grâce à l'option `--roi` de villa : une bande finie est gardée. Reprendre un entraînement depuis son dernier point de sauvegarde.
- **Agent C.** (2026-11-15) : deux surprises. Les bandes ne redonnent pas exactement l'image d'un seul tenant : 0,9 % des pixels diffèrent d'un niveau sur 255, sans couture ; accepté. Et la prédiction n'écrit aucune ligne d'avancement dans un journal : l'IHM avance donc bande par bande.

## Suite

T-011, faite. Règle ajoutée au rituel dans `CLAUDE.md`. Reste à mesurer la vitesse de prédiction sur une zone plus grande avant X-003 ; l'absence de reprise dans la prédiction de villa est une contribution possible, à vérifier d'abord (P-410).
