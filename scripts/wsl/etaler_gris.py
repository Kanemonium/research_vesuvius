"""Réétale les gris d'un aperçu de prédiction pour l'affichage : un aide-vue, pas une mesure.

    python etaler_gris.py <aperçu.png> <sortie.png> <niveau du fond> <niveau de l'encre>

Tout ce qui est au niveau du fond ou en dessous devient noir, tout ce qui est au niveau de l'encre
ou au-dessus devient blanc, et l'entre-deux est étiré. Les zones vides (0) restent noires. Les deux
niveaux sont à prendre dans des mesures (par exemple les médianes sur le fond et l'encre
étiquetés) : ce script ne les devine pas. L'image d'origine n'est pas modifiée.
"""

import sys
from pathlib import Path

import numpy as np
from PIL import Image

source, sortie = Path(sys.argv[1]), Path(sys.argv[2])
fond, encre = float(sys.argv[3]), float(sys.argv[4])
image = np.asarray(Image.open(source).convert("L"), dtype=np.float32)
etale = np.clip((image - fond) / (encre - fond), 0.0, 1.0) * 255.0
etale[image == 0] = 0
Image.fromarray(etale.round().astype(np.uint8)).save(sortie)
blancs = float((etale >= 255).mean()) * 100
noirs = float((etale <= 0).mean()) * 100
taille = f"{etale.shape[0]} x {etale.shape[1]}"
print(f"{sortie.name} : {taille} ; noirs {noirs:.1f} % ; blancs {blancs:.1f} %")
