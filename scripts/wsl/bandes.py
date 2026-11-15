"""Assemble les bandes d'une prédiction découpée, ou compare deux images de prédiction.

    python bandes.py assembler <dossier des bandes> <image de sortie> <l0> <l1> <c0> <c1>
    python bandes.py comparer <image A> <image B>

Les bandes sont les fichiers « bande-<première ligne>-<dernière ligne>.tif » écrits par
predire-par-bandes.sh. L'image assemblée est un TIFF non compressé, écrit bande par bande pour ne
jamais tenir l'image entière en mémoire vive.
"""

import re
import sys
from pathlib import Path

import numpy as np
import tifffile


def assembler(dossier: Path, sortie: Path, l0: int, l1: int, c0: int, c1: int) -> None:
    haut, large = l1 - l0, c1 - c0
    image = tifffile.memmap(sortie, shape=(haut, large), dtype=np.uint8, bigtiff=True)
    couvert = 0
    for fichier in sorted(dossier.glob("bande-*.tif")):
        debut, fin = (
            int(v) for v in re.fullmatch(r"bande-(\d+)-(\d+)\.tif", fichier.name).groups()
        )
        bande = tifffile.imread(fichier)
        # villa peut rendre le rectangle seul, ou l'image entière avec le rectangle rempli :
        # on accepte les deux.
        if bande.shape == (fin - debut, large):
            morceau = bande
        elif bande.shape[0] >= fin and bande.shape[1] >= c1:
            morceau = bande[debut:fin, c0:c1]
        else:
            raise SystemExit(
                f"{fichier.name} : taille {bande.shape} inattendue pour les lignes {debut} à {fin}"
            )
        image[debut - l0 : fin - l0] = morceau
        couvert += fin - debut
        print(f"  {fichier.name} : {morceau.shape[0]} lignes posées")
    image.flush()
    if couvert != haut:
        raise SystemExit(f"bandes incomplètes : {couvert} lignes posées sur {haut}")
    print(f"image assemblée : {haut} × {large} pixels")


def comparer(a: Path, b: Path) -> None:
    x, y = tifffile.imread(a), tifffile.imread(b)
    print(f"A : {a.name} {x.shape} {x.dtype} ; B : {b.name} {y.shape} {y.dtype}")
    if x.shape != y.shape:
        raise SystemExit("tailles différentes : images non comparables")
    ecart = np.abs(x.astype(np.int16) - y.astype(np.int16))
    differents = int((ecart > 0).sum())
    maximal = int(ecart.max())
    print(f"pixels différents : {differents} sur {ecart.size} ; écart maximal : {maximal} sur 255")
    non_nuls, moyenne = int((x > 0).sum()), float(x.mean())
    print(f"pixels non nuls dans A : {non_nuls} ; valeur moyenne de A : {moyenne:.2f}")
    if differents:
        # Où sont les écarts ? Huit tranches horizontales : s'ils se concentraient sur une
        # couture entre deux bandes, une tranche en porterait bien plus que les autres.
        tranches = [int((t > 0).sum()) for t in np.array_split(ecart, 8, axis=0)]
        print(f"pixels différents par tranche horizontale (de haut en bas) : {tranches}")
    print("IDENTIQUES" if differents == 0 else "DIFFÉRENTES")


if __name__ == "__main__":
    if len(sys.argv) == 8 and sys.argv[1] == "assembler":
        assembler(Path(sys.argv[2]), Path(sys.argv[3]), *(int(v) for v in sys.argv[4:8]))
    elif len(sys.argv) == 4 and sys.argv[1] == "comparer":
        comparer(Path(sys.argv[2]), Path(sys.argv[3]))
    else:
        raise SystemExit(__doc__)
