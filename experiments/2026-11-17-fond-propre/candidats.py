"""Propose des carrés de papyrus loin de toute annotation, pour que quelqu'un dise s'ils sont vierges.

    python candidats.py <prédiction.tif> <masque de supervision.tif> <surface.zarr> <aperçus> <candidats.json>

Ce script ne décide rien : il ne sait pas reconnaître une lettre. Il écarte les carrés qui touchent
une zone vide ou qui sont à moins de 512 pixels d'une annotation, puis en retient seize, en deux
familles :
  A  ceux où la carte d'encre de X-003 a le moins de pixels très clairs ;
  B  ceux où elle est d'un gris moyen et uniforme, le « fond gris » que l'on veut corriger.
Il écrit une planche (surface à gauche, carte d'encre à droite, pour chaque carré numéroté), une
carte d'ensemble, et la liste des carrés avec leurs mesures. Lecture seule sur les entrées ; les
deux images vont dans un dossier hors du dépôt.
"""

import json
import sys
from pathlib import Path

import numpy as np
import tifffile
import zarr
from PIL import Image, ImageDraw
from scipy import ndimage

COTE = 1024      # côté d'un carré, en pixels du segment
PAS = 8          # réduction de travail : le niveau 3 du volume de surface
MARGE = 512      # distance minimale à toute annotation, en pixels du segment
PAR_FAMILLE = 8
ECART = 3        # deux carrés retenus sont séparés d'au moins trois carrés
BLOC = 1024


def ouvrir(chemin: str):
    """Ouvre un TIFF sans le charger en entier : on le lit par tranches de lignes."""
    return zarr.open(tifffile.imread(chemin, aszarr=True), mode="r")


def reduire(bloc: np.ndarray, pas: int) -> np.ndarray:
    h, w = (bloc.shape[0] // pas) * pas, (bloc.shape[1] // pas) * pas
    return bloc[:h, :w].reshape(h // pas, pas, w // pas, pas).mean(axis=(1, 3))


def choisir(ordre: list[int], cases: list[tuple[int, int]], pris: list[tuple[int, int]]) -> list[int]:
    """Parcourt les carrés dans l'ordre donné et garde ceux qui sont assez loin des précédents."""
    gardes = []
    for k in ordre:
        l, c = cases[k]
        if all(max(abs(l - a), abs(c - b)) >= ECART for a, b in pris):
            gardes.append(k)
            pris.append((l, c))
        if len(gardes) == PAR_FAMILLE:
            break
    return gardes


def main() -> None:
    prediction, masque = ouvrir(sys.argv[1]), ouvrir(sys.argv[2])
    surface = zarr.open(sys.argv[3], mode="r")["2"]
    apercus, sortie = Path(sys.argv[4]), Path(sys.argv[5])
    haut, large = prediction.shape
    print(f"prédiction {prediction.shape} ; masque {masque.shape} ; surface niveau 2 {surface.shape}")
    if prediction.shape != masque.shape:
        raise SystemExit("tailles différentes : images non comparables")

    moyenne, claire, vide, annote = [], [], [], []
    for debut in range(0, haut - haut % BLOC, BLOC):
        p = np.asarray(prediction[debut : debut + BLOC])
        m = np.asarray(masque[debut : debut + BLOC]) > 0
        moyenne.append(reduire(p, PAS))
        claire.append(reduire((p >= 192).astype(np.float32), PAS))
        vide.append(reduire((p == 0).astype(np.float32), PAS))
        annote.append(reduire(m.astype(np.float32), PAS))
    moyenne, claire, vide, annote = (np.concatenate(x) for x in (moyenne, claire, vide, annote))
    distance = ndimage.distance_transform_edt(annote == 0) * PAS
    print(f"part annotée : {100 * annote.mean():.2f} % ; part vide : {100 * vide.mean():.2f} %")

    n = COTE // PAS
    cases, mesures = [], []
    for l in range(moyenne.shape[0] // n):
        for c in range(moyenne.shape[1] // n):
            ou = (slice(l * n, (l + 1) * n), slice(c * n, (c + 1) * n))
            if vide[ou].max() > 0 or distance[ou].min() < MARGE:
                continue
            cases.append((l, c))
            mesures.append((float(moyenne[ou].mean()), float(claire[ou].mean()), float(moyenne[ou].std()),
                            float(distance[ou].min())))
    total = (moyenne.shape[0] // n) * (moyenne.shape[1] // n)
    print(f"carrés de {COTE} : {total} en tout, {len(cases)} sans vide et à plus de {MARGE} px d'une annotation")
    if not cases:
        raise SystemExit("aucun carré candidat")
    m = np.array(mesures)
    print(f"sur ces carrés : moyenne médiane {np.median(m[:, 0]):.0f} sur 255 ; "
          f"part très claire médiane {100 * np.median(m[:, 1]):.1f} %")

    pris: list[tuple[int, int]] = []
    famille_a = choisir(list(np.argsort(m[:, 1])), cases, pris)
    gris = [k for k in np.argsort(m[:, 2]) if 120 <= m[k, 0] <= 160]
    famille_b = choisir(gris, cases, pris)
    retenus = [("A", k) for k in famille_a] + [("B", k) for k in famille_b]

    liste = []
    cellule, blanc = 256, 8
    colonnes = 4
    rangees = -(-len(retenus) // colonnes)
    planche = Image.new("L", (colonnes * (2 * cellule + 3 * blanc), rangees * (cellule + 28 + blanc)), 40)
    trait = ImageDraw.Draw(planche)
    reduit = 4 * PAS
    ensemble = np.repeat(reduire(moyenne, 4)[..., None], 3, axis=2)
    ensemble[reduire(annote, 4) > 0] = ensemble[reduire(annote, 4) > 0] * 0.4 + np.array([40, 110, 200]) * 0.6
    carte = Image.fromarray(ensemble.round().astype(np.uint8))
    trait_carte = ImageDraw.Draw(carte)
    for i, (famille, k) in enumerate(retenus, start=1):
        l, c = cases[k]
        y, x = l * COTE, c * COTE
        liste.append({"numero": i, "famille": famille, "ligne": y, "colonne": x, "cote": COTE,
                      "moyenne": round(m[k, 0], 1), "part_tres_claire": round(m[k, 1], 4),
                      "ecart_type": round(m[k, 2], 1), "distance_annotation": round(m[k, 3])})
        vue = np.asarray(surface[32, y // 4 : (y + COTE) // 4, x // 4 : (x + COTE) // 4])
        carte_encre = reduire(np.asarray(prediction[y : y + COTE, x : x + COTE]), 4).round().astype(np.uint8)
        x0 = ((i - 1) % colonnes) * (2 * cellule + 3 * blanc) + blanc
        y0 = ((i - 1) // colonnes) * (cellule + 28 + blanc)
        trait.text((x0, y0 + 8), f"{i}  {famille}  moyenne {m[k, 0]:.0f}  claire {100 * m[k, 1]:.1f} %", fill=255)
        planche.paste(Image.fromarray(vue), (x0, y0 + 28))
        planche.paste(Image.fromarray(carte_encre), (x0 + cellule + blanc, y0 + 28))
        couleur = (240, 140, 40) if famille == "A" else (250, 220, 60)
        trait_carte.rectangle((x // reduit, y // reduit, (x + COTE) // reduit, (y + COTE) // reduit), outline=couleur, width=3)
        trait_carte.text((x // reduit + 6, y // reduit + 4), str(i), fill=couleur)
        print(f"{i:2d} {famille} ligne {y:5d} colonne {x:5d} : moyenne {m[k, 0]:5.1f}, très clair {100 * m[k, 1]:4.1f} %, "
              f"écart-type {m[k, 2]:4.1f}, à {m[k, 3]:.0f} px d'une annotation")
    apercus.mkdir(parents=True, exist_ok=True)
    planche.save(apercus / "X-011-candidats.png", optimize=True)
    carte.save(apercus / "X-011-carte.png", optimize=True)
    sortie.write_text(json.dumps({"cote": COTE, "marge": MARGE, "carres": liste}, indent=2, ensure_ascii=False) + "\n",
                      encoding="utf-8")
    print(f"planche {planche.size}, carte {carte.size}, {len(liste)} carrés écrits dans {sortie.name}")


if __name__ == "__main__":
    main()
