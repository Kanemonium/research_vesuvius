"""Compare une image d'encre prédite aux étiquettes du segment : le modèle a-t-il appris ou récité ?

    python comparer_aux_etiquettes.py <prédiction.tif> <étiquettes.tif> <masque.tif> <sortie> <nom>

Le masque de supervision dit où les étiquettes sont fiables : c'est la seule zone que l'entraînement
a vue avec son corrigé. On mesure donc la prédiction dans trois zones : encre étiquetée, fond
étiqueté, et tout le reste du papyrus, que le modèle n'a jamais vu corrigé. Trois aperçus réduits
« <nom>-zones.png », « <nom>-hors-etiquettes.png » et « <nom>-etiquettes.png » sont écrits dans le
dossier de sortie, qui doit rester hors du dépôt. Lecture seule sur les trois images d'entrée.
"""

import sys
from pathlib import Path

import numpy as np
import tifffile
import zarr
from PIL import Image

PAS = 16  # réduction des aperçus
BLOC = 1024
ZONES = ("encre étiquetée", "fond étiqueté", "papyrus jamais corrigé")
BLEU, ORANGE = np.array([40, 110, 200]), np.array([240, 140, 40])


def ouvrir(chemin: Path):
    """Ouvre un TIFF sans le charger en entier : on le lira par tranches de lignes."""
    return zarr.open(tifffile.imread(chemin, aszarr=True), mode="r")


def reduire(bloc: np.ndarray) -> np.ndarray:
    h, w = (bloc.shape[0] // PAS) * PAS, (bloc.shape[1] // PAS) * PAS
    return bloc[:h, :w].reshape(h // PAS, PAS, w // PAS, PAS).mean(axis=(1, 3))


def enregistrer(image: np.ndarray, fichier: Path) -> None:
    Image.fromarray(image.round().astype(np.uint8)).save(fichier)


def main() -> None:
    prediction, etiquettes, masque = (ouvrir(Path(p)) for p in sys.argv[1:4])
    sortie, nom = Path(sys.argv[4]), sys.argv[5]
    sortie.mkdir(parents=True, exist_ok=True)
    print(f"prédiction {prediction.shape} ; étiquettes {etiquettes.shape} ; masque {masque.shape}")
    if not (prediction.shape == etiquettes.shape == masque.shape):
        raise SystemExit("tailles différentes : images non comparables")
    haut = prediction.shape[0]

    histos = {z: np.zeros(256, dtype=np.int64) for z in ZONES}
    vides = 0
    vp = fp = fn = 0  # accord au seuil 128, dans la zone supervisée seulement
    apercus = {"p": [], "e": [], "m": []}
    for debut in range(0, haut, BLOC):
        p = np.asarray(prediction[debut : debut + BLOC])
        e = np.asarray(etiquettes[debut : debut + BLOC]) > 0
        m = np.asarray(masque[debut : debut + BLOC]) > 0
        vide = p == 0
        vides += int(vide.sum())
        for zone, ou in zip(ZONES, (m & e, m & ~e, ~m & ~vide), strict=True):
            histos[zone] += np.bincount(p[ou], minlength=256)
        clair = p >= 128
        vp += int((clair & e & m).sum())
        fp += int((clair & ~e & m).sum())
        fn += int((~clair & e & m).sum())
        apercus["p"].append(reduire(p))
        apercus["e"].append(reduire(e.astype(np.uint8) * 255))
        apercus["m"].append(reduire(m.astype(np.uint8) * 255))

    total = prediction.shape[0] * prediction.shape[1]
    niveaux = np.arange(256)
    print(f"pixels : {total} ; vides : {100 * vides / total:.2f} %")
    for zone in ZONES:
        h = histos[zone]
        n = int(h.sum())
        if not n:
            print(f"{zone} : aucun pixel")
            continue
        mediane = int(np.searchsorted(np.cumsum(h) / n, 0.5))
        print(
            f"{zone} : {n} pixels ({100 * n / total:.2f} % de l'image) ; "
            f"moyenne {(h * niveaux).sum() / n:.1f} ; médiane {mediane} ; "
            f">=128 : {100 * h[128:].sum() / n:.1f} % ; >=192 : {100 * h[192:].sum() / n:.1f} %"
        )
    clairs = {z: int(histos[z][192:].sum()) for z in ZONES}
    tous = sum(clairs.values())
    parts = " ; ".join(f"{z} {100 * c / tous:.1f} %" for z, c in clairs.items())
    print(f"où sont les pixels très clairs (>=192) : {parts}")
    dice = 2 * vp / max(1, 2 * vp + fp + fn)
    rappel, precision = vp / max(1, vp + fn), vp / max(1, vp + fp)
    print(
        f"zone supervisée, seuil 128 : Dice {dice:.3f} ; "
        f"rappel {rappel:.3f} ; précision {precision:.3f}"
    )

    p, e, m = (np.concatenate(apercus[k]) for k in ("p", "e", "m"))
    # 1. La prédiction, teintée là où le modèle a eu le corrigé :
    #    bleu = fond étiqueté, orange = encre étiquetée.
    rvb = np.stack([p, p, p], axis=-1)
    supervise, encre = m > 127, e > 127
    rvb[supervise & ~encre] = rvb[supervise & ~encre] * 0.55 + BLEU * 0.45
    rvb[encre] = rvb[encre] * 0.45 + ORANGE * 0.55
    enregistrer(rvb, sortie / f"{nom}-zones.png")
    # 2. La prédiction seule, zone supervisée noircie : ce que le modèle dit là où il n'a
    #    jamais eu de corrigé.
    hors = p.copy()
    hors[m > 12] = 0
    enregistrer(hors, sortie / f"{nom}-hors-etiquettes.png")
    # 3. Les étiquettes elles-mêmes, pour comparer à l'œil.
    enregistrer(e, sortie / f"{nom}-etiquettes.png")
    print(f"aperçus écrits dans {sortie.name} : {p.shape[0]} x {p.shape[1]} pixels")


if __name__ == "__main__":
    main()
