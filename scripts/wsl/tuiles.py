"""Découpe une image de prédiction en tuiles, pour la parcourir dans l'IHM sans tout charger.

    python tuiles.py <prédiction.tif> <étiquettes.tif> <masque.tif> <sortie> <fond> <encre> [pas]

Trois jeux de tuiles JPEG de 512 pixels sont écrits dans <sortie>/<variante>/<ligne>_<colonne>.jpg :
  brut    la prédiction telle qu'elle est ;
  etale   les gris réétalés entre le niveau du fond et celui de l'encre (un aide-vue) ;
  zones   la prédiction teintée là où le modèle a eu le corrigé (bleu : fond, orange : encre).
La réduction (« pas », 4 par défaut) moyenne des carrés de pixels : à 4, une lettre reste bien
lisible et le jeu complet pèse quelques dizaines de Mo. <sortie> doit rester hors du dépôt.
Lecture seule sur les trois images d'entrée, lues par tranches pour ne jamais les tenir en mémoire.
"""

import json
import sys
from pathlib import Path

import numpy as np
import tifffile
import zarr
from PIL import Image

TUILE = 512
BLEU, ORANGE = np.array([40, 110, 200]), np.array([240, 140, 40])


def ouvrir(chemin: str):
    return zarr.open(tifffile.imread(chemin, aszarr=True), mode="r")


def reduire(bloc: np.ndarray, pas: int) -> np.ndarray:
    h, w = (bloc.shape[0] // pas) * pas, (bloc.shape[1] // pas) * pas
    return bloc[:h, :w].astype(np.float32).reshape(h // pas, pas, w // pas, pas).mean(axis=(1, 3))


def main() -> None:
    prediction, etiquettes, masque = (ouvrir(p) for p in sys.argv[1:4])
    sortie, fond, encre = Path(sys.argv[4]), float(sys.argv[5]), float(sys.argv[6])
    pas = int(sys.argv[7]) if len(sys.argv) > 7 else 4
    haut, large = prediction.shape
    bande = TUILE * pas  # lignes d'origine couvertes par une rangée de tuiles
    for variante in ("brut", "etale", "zones"):
        (sortie / variante).mkdir(parents=True, exist_ok=True)

    rangees = 0
    colonnes = 0
    for rangee, debut in enumerate(range(0, haut, bande)):
        p = reduire(np.asarray(prediction[debut : debut + bande]), pas)
        if not p.size:
            break
        e = reduire((np.asarray(etiquettes[debut : debut + bande]) > 0) * 255, pas) > 127
        m = reduire((np.asarray(masque[debut : debut + bande]) > 0) * 255, pas) > 127
        etale = np.clip((p - fond) / (encre - fond), 0.0, 1.0) * 255.0
        etale[p == 0] = 0
        zones = np.stack([p, p, p], axis=-1)
        zones[m & ~e] = zones[m & ~e] * 0.55 + BLEU * 0.45
        zones[e] = zones[e] * 0.45 + ORANGE * 0.55
        images = {"brut": p, "etale": etale, "zones": zones}
        colonnes = 0
        for colonne, gauche in enumerate(range(0, p.shape[1], TUILE)):
            for variante, image in images.items():
                morceau = image[:, gauche : gauche + TUILE].round().astype(np.uint8)
                fichier = sortie / variante / f"{rangee}_{colonne}.jpg"
                Image.fromarray(morceau).save(fichier, quality=85)
            colonnes = colonne + 1
        rangees = rangee + 1
        print(f"rangée {rangees} écrite ({colonnes} tuiles par variante)", flush=True)

    meta = {
        "tuile": TUILE,
        "reduction": pas,
        "rangees": rangees,
        "colonnes": colonnes,
        "hauteur": haut // pas,
        "largeur": large // pas,
        "hauteur_origine": haut,
        "largeur_origine": large,
        "variantes": ["brut", "etale", "zones"],
        "fond": fond,
        "encre": encre,
    }
    (sortie / "meta.json").write_text(json.dumps(meta, indent=1), encoding="utf-8")
    print(f"{rangees} x {colonnes} tuiles par variante, réduction {pas}")


if __name__ == "__main__":
    main()
