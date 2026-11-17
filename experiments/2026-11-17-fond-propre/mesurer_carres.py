"""Mesure ce qu'un modèle répond sur les carrés jugés vierges : quelle part il marque comme encre.

    python mesurer_carres.py <prédiction.tif> <candidats.json> <choix.json> <seuil> <nom>

Pour chaque carré « fond » et « contrôle » : la réponse moyenne (0 à 255) et la part des pixels au
seuil ou au-dessus. Sur un carré vraiment vierge, cette part devrait être nulle. Lecture seule.
"""

import json
import sys
from pathlib import Path

import numpy as np
import tifffile
import zarr


def main() -> None:
    prediction = zarr.open(tifffile.imread(sys.argv[1], aszarr=True), mode="r")
    carres = {c["numero"]: c for c in json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))["carres"]}
    choix = json.loads(Path(sys.argv[3]).read_text(encoding="utf-8"))
    seuil, nom = int(sys.argv[4]), sys.argv[5]
    print(f"{nom} : part des pixels à {seuil} ou plus sur 255")
    for role in ("fond", "controle"):
        marques = total = somme = 0
        for numero in choix[role]:
            c = carres[numero]
            p = np.asarray(prediction[c["ligne"] : c["ligne"] + c["cote"], c["colonne"] : c["colonne"] + c["cote"]])
            marques += int((p >= seuil).sum())
            total += p.size
            somme += int(p.sum(dtype=np.int64))
            print(f"  carré {numero:2d} ({role}) : moyenne {p.mean():5.1f} ; marqué encre {100 * (p >= seuil).mean():5.2f} %")
        print(f"  {role}, {len(choix[role])} carrés : moyenne {somme / total:5.1f} ; marqué encre {100 * marques / total:5.2f} %")


if __name__ == "__main__":
    main()
