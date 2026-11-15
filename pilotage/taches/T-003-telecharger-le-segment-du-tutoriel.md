---
id: T-003
titre: "Télécharger le segment du tutoriel"
statut: faite
piste: P-310
priorite: 1
responsable: "Agent C."
echeance: null
issue: null
creee: 2026-11-14
etapes:
  - date: 2026-11-14
    genre: etape
    statut: faite
    titre: Vérifier l'espace disque et demander l'accord
    detail: Accord de Kanemonium donné avant le téléchargement.
  - date: 2026-11-14
    genre: bug
    statut: corrige
    titre: Le téléchargement s'arrête à 6,5 Go sans message
    detail: "La cause était de notre côté : la commande avait été lancée avec une limite de dix minutes. Relancée sans limite ; `hf buckets sync` reprend là où il s'était arrêté."
  - date: 2026-11-14
    genre: bug
    statut: contourne
    titre: 92 Go au lieu des 25 annoncés
    detail: "Le dossier du segment pèse 92 Go côté serveur (147 785 fichiers) : le volume de surface est fourni à six résolutions. L'entraînement n'utilise que la plus fine, 63 Go sur le disque. Écart signalé dans le compte rendu, non corrigé : tout a été téléchargé."
  - date: 2026-11-14
    genre: etape
    statut: faite
    titre: Télécharger le segment
    detail: 147 785 fichiers reçus, le même nombre que côté serveur ; 87 Go sur le disque.
  - date: 2026-11-14
    genre: etape
    statut: faite
    titre: Contrôler ce qui est arrivé
    detail: "`scripts/wsl/controler-segment.sh`, puis le contrôle de villa (`validate_segments`) : les TIFF correspondent au volume et les étiquettes sont bien binaires."
---

Segment w00_20231016151002 de PHerc. Paris. 4, environ 25 Go d'après le tutoriel. Vérifier l'espace disque avant, et demander l'accord de Kanemonium pour le téléchargement.

**2026-11-14** : en cours. Le dossier du segment pèse en réalité **92 Go** côté serveur (147 785 fichiers), pas 25 : le volume de surface est fourni à six résolutions, dont 67 Go pour la plus fine. Mesuré avec `hf buckets ls -R`. Reçu : 53 Go, à environ 11 Mo/s. Un premier essai s'était arrêté à 6,5 Go sans message d'erreur ; `scripts/wsl/controler-segment.sh` vérifie désormais que les étiquettes et la géométrie sont bien là.

**2026-11-14** : fait. 147 785 fichiers reçus, le même nombre que côté serveur ; 87 Go sur le disque. Le contrôle de villa (`validate_segments`) passe : les TIFF correspondent au volume et les étiquettes sont bien binaires.
