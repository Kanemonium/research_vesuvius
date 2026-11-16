"""Tableau de l'essai X-005 : pour chaque réglage, le débit hors démarrage et le coût du démarrage.

Deux zones par réglage. Le débit est la pente entre les deux : blocs en plus, divisés par les
secondes en plus. Le démarrage (chargement, compilation éventuelle) est ce qui reste de la petite
zone une fois ses blocs retirés à ce débit. Deux points seulement : pas de barre d'erreur.

Usage : python3 tableau.py <mesures.tsv>
"""

import sys
from pathlib import Path


def lire(fichier: Path) -> dict[str, dict[str, tuple[int, float, int, int]]]:
    mesures: dict[str, dict[str, tuple[int, float, int, int]]] = {}
    for ligne in fichier.read_text(encoding="utf-8").splitlines():
        nom, taille, blocs, secondes, vram, code = ligne.split("\t")
        mesures.setdefault(nom, {})[taille] = (int(blocs), float(secondes), int(vram), int(code))
    return mesures


def resumer(petite: tuple, grande: tuple) -> str:
    (b0, t0, v0, c0), (b1, t1, v1, c1) = petite, grande
    if c0 or c1:
        return f"non terminé (codes {c0} et {c1}) ; pic de mémoire vidéo {max(v0, v1)} Mo"
    if b1 <= b0 or t1 <= t0:
        return "inexploitable : la grande zone n'a pas pris plus de temps que la petite"
    debit = (b1 - b0) / (t1 - t0)
    demarrage = t0 - b0 / debit
    return (
        f"{b0} blocs en {t0:.0f} s, {b1} blocs en {t1:.0f} s ; débit {debit:.1f} blocs/s ; "
        f"démarrage {demarrage:.0f} s ; pic de mémoire vidéo {max(v0, v1)} Mo"
    )


if __name__ == "__main__":
    if len(sys.argv) != 2:
        raise SystemExit(__doc__)
    for nom, zones in lire(Path(sys.argv[1])).items():
        if "petite" in zones and "grande" in zones:
            print(f"{nom} : {resumer(zones['petite'], zones['grande'])}")
        else:
            print(f"{nom} : mesure incomplète")
