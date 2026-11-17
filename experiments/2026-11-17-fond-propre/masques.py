"""Écrit les étiquettes en version 2 : la zone de supervision du tutoriel, plus les carrés jugés vierges.

    python masques.py <dossier du segment> <candidats.json> <choix.json> <masque des carrés.tif>

Rien n'est écrasé. À côté des fichiers du tutoriel, le script écrit :
  <segment>_supervision_mask_v2.tif   le masque du tutoriel, plus les carrés « fond » ;
  <segment>_inklabels_v2.tif          une copie des étiquettes d'encre (les carrés y sont déjà noirs) ;
  <segment>_validation_mask_v2.tif    une copie des régions mises de côté.
villa demande que les trois existent à la même version. Les carrés « contrôle » n'entrent nulle part :
le modèle ne doit jamais les voir corrigés. Le quatrième argument reçoit un masque des carrés « fond »
et « contrôle », pour ne prédire que là ; il doit rester hors du dossier du segment.
Un carré qui toucherait une annotation ou une région mise de côté arrête le script.
"""

import json
import shutil
import sys
from pathlib import Path

import numpy as np
import tifffile


def main() -> None:
    segment, sortie = Path(sys.argv[1]), Path(sys.argv[4])
    carres = {c["numero"]: c for c in json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))["carres"]}
    choix = json.loads(Path(sys.argv[3]).read_text(encoding="utf-8"))
    nom = segment.name
    v2 = segment / f"{nom}_supervision_mask_v2.tif"
    if v2.exists() and sortie.exists():
        print("masques déjà écrits, sauté")
        return

    masque = tifffile.imread(segment / f"{nom}_supervision_mask.tif")
    etiquettes = tifffile.imread(segment / f"{nom}_inklabels.tif")
    print(f"masque du tutoriel {masque.shape} : {100 * (masque > 0).mean():.2f} % de l'image")
    ou_carres = np.zeros(masque.shape, dtype=np.uint8)
    for role in ("fond", "controle"):
        for numero in choix[role]:
            c = carres[numero]
            zone = (slice(c["ligne"], c["ligne"] + c["cote"]), slice(c["colonne"], c["colonne"] + c["cote"]))
            if masque[zone].any() or etiquettes[zone].any():
                raise SystemExit(f"le carré {numero} touche une annotation : rien n'est écrit")
            ou_carres[zone] = 255
            print(f"carré {numero:2d} ({role}) : ligne {c['ligne']}, colonne {c['colonne']}")
    del etiquettes
    sortie.parent.mkdir(parents=True, exist_ok=True)
    tifffile.imwrite(sortie, ou_carres, compression="deflate")
    del ou_carres

    avant = int((masque > 0).sum())
    for numero in choix["fond"]:
        c = carres[numero]
        masque[c["ligne"] : c["ligne"] + c["cote"], c["colonne"] : c["colonne"] + c["cote"]] = 255
    apres = int((masque > 0).sum())
    tifffile.imwrite(v2, masque, compression="deflate")
    for genre in ("inklabels", "validation_mask"):
        shutil.copyfile(segment / f"{nom}_{genre}.tif", segment / f"{nom}_{genre}_v2.tif")
    print(f"zone de supervision : {avant} pixels avant, {apres} après (+{100 * (apres - avant) / avant:.1f} %), "
          f"soit {100 * apres / masque.size:.2f} % de l'image")
    print(f"écrit : {v2.name}, {nom}_inklabels_v2.tif, {nom}_validation_mask_v2.tif, {sortie.name}")


if __name__ == "__main__":
    main()
