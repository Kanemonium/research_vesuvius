---
id: T-006
titre: "Créer le dépôt GitHub et pousser"
statut: faite
piste: D-002
priorite: 1
responsable: "Kanemonium"
echeance: null
issue: null
creee: 2026-11-14
etapes:
  - date: 2026-11-14
    genre: etape
    statut: faite
    titre: Créer le dépôt public
    detail: "`Kanemonium/research_vesuvius`, sur accord de Kanemonium."
  - date: 2026-11-14
    genre: bug
    statut: corrige
    titre: Envoi refusé (erreur 403)
    detail: Le jeton n'avait pas le droit d'écrire le contenu ni les fichiers de CI. Kanemonium en a créé un nouveau, rangé dans `.env`.
  - date: 2026-11-14
    genre: etape
    statut: faite
    titre: Premier envoi
    detail: La CI s'est lancée et passe.
---

Le dépôt local existe, rien n'est encore publié. Kanemonium choisit : public tout de suite, ou privé d'abord. La CI se lancera au premier envoi.

**2026-11-14** : dépôt public créé (`Kanemonium/research_vesuvius`) et premier envoi fait.
