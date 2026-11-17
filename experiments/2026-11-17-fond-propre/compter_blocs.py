"""X-013 : compter les blocs d'entraînement que villa tire, sans rien entraîner.

Usage : python compter_blocs.py <réglage.json> <ancienne liste de blocs.json> <candidats.json> <choix.json>

Le script est le nôtre. Il appelle la recherche de blocs de ScrollPrize/villa (licence MIT),
https://github.com/ScrollPrize/villa au commit 2d3fb38, par les mêmes fonctions que l'entraînement :
la liste comptée est celle qu'un entraînement lancé avec ce réglage utiliserait.
"""
import json
import sys

from vesuvius.ink_detection.data.dataset import InkDataset
from vesuvius.ink_detection.training.train import stage_training_request, training_dataset_config

reglage, ancienne, candidats, choix = sys.argv[1:5]

config = stage_training_request(reglage).config
jeu = InkDataset(training_dataset_config(config), do_augmentations=False)


def yx(bbox):
    """Le rectangle (y0, y1, x0, x1) d'un bloc, que villa range en (z0, y0, x0, z1, y1, x1)."""
    z0, y0, x0, z1, y1, x1 = (int(v) for v in bbox)
    if (z1 - z0, y1 - y0, x1 - x0) != (64, 128, 128):
        raise SystemExit(f"bloc de taille inattendue : {bbox}")
    return y0, y1, x0, x1


print("premier bloc :", list(jeu.training_patches[0].bbox))

carres = {c["numero"]: c for c in json.load(open(candidats))["carres"]}
roles = json.load(open(choix))
fond = [carres[n] for n in roles["fond"]]
controle = [carres[n] for n in roles["controle"]]


def touche(rect, liste):
    y0, y1, x0, x1 = rect
    for c in liste:
        if y0 < c["ligne"] + c["cote"] and y1 > c["ligne"] and x0 < c["colonne"] + c["cote"] and x1 > c["colonne"]:
            return c["numero"]
    return None


avant = json.load(open(ancienne))
avant_entr = {tuple(r["bbox"]) for r in avant if not r["is_validation"]}
avant_val = {tuple(r["bbox"]) for r in avant if r["is_validation"]}
apres_entr = {tuple(int(v) for v in p.bbox) for p in jeu.training_patches}
apres_val = {tuple(int(v) for v in p.bbox) for p in jeu.validation_patches}

print(f"entraînement : {len(avant_entr)} blocs avant, {len(apres_entr)} après")
print(f"validation   : {len(avant_val)} blocs avant, {len(apres_val)} après ; identiques : {avant_val == apres_val}")
print(f"blocs d'entraînement d'avant encore là : {len(avant_entr & apres_entr)} sur {len(avant_entr)}")

nouveaux = apres_entr - avant_entr
par_carre = {}
ailleurs = 0
for bbox in sorted(nouveaux):
    n = touche(yx(bbox), fond)
    if n is None:
        ailleurs += 1
    else:
        par_carre[n] = par_carre.get(n, 0) + 1
print(f"blocs nouveaux : {len(nouveaux)}")
for n in roles["fond"]:
    print(f"  carré {n:2d} (fond) : {par_carre.get(n, 0)} blocs")
print(f"  dans les neuf carrés de fond : {sum(par_carre.values())} blocs")
print(f"  ailleurs, dans l'ancienne zone de supervision : {ailleurs} blocs")
dans_controle = sum(1 for bbox in apres_entr | apres_val if touche(yx(bbox), controle) is not None)
print(f"blocs touchant un carré de contrôle (doit être 0) : {dans_controle}")
total = len(apres_entr)
print(f"part des blocs d'entraînement : carrés {100 * sum(par_carre.values()) / total:.1f} %, "
      f"nouveaux ailleurs {100 * ailleurs / total:.1f} %, anciens {100 * len(avant_entr & apres_entr) / total:.1f} %")
