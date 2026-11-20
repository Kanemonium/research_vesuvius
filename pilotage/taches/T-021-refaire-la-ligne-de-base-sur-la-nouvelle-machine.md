---
id: T-021
titre: "Refaire la ligne de base sur la nouvelle machine"
statut: faite
piste: P-420
priorite: 1
responsable: "Agent C."
echeance: null
issue: null
creee: 2026-11-20
etapes:
  - date: 2026-11-20
    genre: etape
    statut: faite
    titre: "Vérifier la nouvelle machine après la migration"
    detail: "RTX 5080 16 Go, 16 cœurs, 22 Go pour WSL ; PyTorch 2.12.1 (CUDA 13.0) reconnaît la carte. villa au commit `0bddf27`. Le segment du tutoriel n'avait pas suivi la migration (A-409)."
  - date: 2026-11-20
    genre: etape
    statut: faite
    titre: "Retélécharger le segment du tutoriel"
    detail: "87 Go reçus en 4 h 14 (12 h 01 à 16 h 15, heure du journal), à 6 à 9 Mo/s selon les relevés. `controler-segment.sh` : tous les fichiers attendus présents, 147 778 fichiers dans les trois volumes."
  - date: 2026-11-20
    genre: etape
    statut: faite
    titre: "Vérifier que le code d'encre de villa n'a pas changé"
    detail: "Entre `2d3fb38` (X-002) et `0bddf27`, le dossier `ink_detection` est identique fichier pour fichier. Seuls `neural_tracing` et `uv.lock` diffèrent ; l'environnement est déjà synchronisé, PyTorch reste en 2.12.1."
  - date: 2026-11-20
    genre: etape
    statut: faite
    titre: "Entraîner à l'identique (X-015)"
    detail: "43 min 45 s au lieu de 1 h 53 min 51 s, 7,70 itérations par seconde au lieu de 2,93, pic de mémoire vidéo de 6 694 Mo. Mêmes 8 098 blocs dans le même ordre. La perte suit celle de X-002 jusqu'à 11 000 itérations, puis finit plus bas (0,344 au lieu de 0,389, même méthode de calcul) : ce n'est pas une preuve de meilleur modèle."
---

Fait quand X-015 est terminée et comparée à X-002 : durée, pic de mémoire vidéo, courbe de perte.
Ses chiffres deviennent la référence de la nouvelle machine pour les essais suivants, X-014 compris.
