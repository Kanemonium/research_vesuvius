---
id: P-513
titre: "V1.3 : le tiroir Discord et GitHub"
type: piste
domaine: pilotage
statut: validee
parent: P-510
date: 2026-11-15
---

## Constat

Un tiroir à droite pour suivre en français les échanges du défi : synthèse, mentions, actualité et règles de contribution de villa, avec la provenance de chaque message (Discord ou GitHub).

## Réflexions

- **Kanemonium** (2026-11-15) : un tiroir avec sa tirette, trois puis quatre onglets, des couleurs, et l'actualité de GitHub dans les mêmes flux.
- **Agent C.** (2026-11-15) : le tiroir ne parle jamais à Discord, il montre une lecture faite à la demande et gardée sur la machine. Cadre dans D-010.
- **Agent C.** (2026-11-15) : régression introduite par cette version et corrigée le jour même. Le tiroir Discord portait la même classe `.tiroir` que le volet de la carte, qui ne s'ouvrait plus ; ses classes ont maintenant leur propre préfixe.
- **Kanemonium** (2026-11-17) : valide la V1.3 et la V1.4.
- **Agent C.** (2026-11-17) : rien à fusionner, tout est déjà sur la branche principale. Ce qui restait dans T-012 (les longs fils du forum, l'envoi d'une réponse) ne fait pas partie de la V1.3 : c'est l'avancée ouverte A-510.

## Suite

Livrée dans les commits `fdb1e20` et `657cbfb`. Validée par Kanemonium le 2026-11-17. T-012 continue pour la suite : lire les longs fils du forum, roder l'envoi d'une réponse (A-510).
