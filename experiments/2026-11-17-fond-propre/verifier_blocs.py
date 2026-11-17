"""X-014 : avant d'entraîner, vérifier que villa prendra bien notre liste de blocs.

Usage : python verifier_blocs.py <réglage.json> <liste.json>

Le script est le nôtre. Il ouvre le jeu de données par les fonctions de l'entraînement de
ScrollPrize/villa (licence MIT, https://github.com/ScrollPrize/villa, commit 2d3fb38). Si villa juge la
liste périmée, il la refait et l'écrase sans le dire : le script s'arrête alors avec une erreur, pour
ne pas rejouer X-012, où trois heures d'entraînement n'avaient rien changé.
"""
import hashlib
import json
import sys

from vesuvius.ink_detection.data.dataset import InkDataset
from vesuvius.ink_detection.training.train import stage_training_request, training_dataset_config

reglage, liste = sys.argv[1:3]
empreinte = hashlib.md5(open(liste, "rb").read()).hexdigest()
attendu = json.load(open(liste))
attendu_entr = {tuple(b["bbox"]) for b in attendu if not b["is_validation"]}
attendu_val = {tuple(b["bbox"]) for b in attendu if b["is_validation"]}

jeu = InkDataset(training_dataset_config(stage_training_request(reglage).config), do_augmentations=False)
entr = {tuple(int(v) for v in p.bbox) for p in jeu.training_patches}
val = {tuple(int(v) for v in p.bbox) for p in jeu.validation_patches}

print(f"villa annonce {len(entr)} blocs d'entraînement et {len(val)} de validation ; "
      f"la liste en compte {len(attendu_entr)} et {len(attendu_val)}")
if hashlib.md5(open(liste, "rb").read()).hexdigest() != empreinte:
    raise SystemExit("villa a réécrit la liste : elle était jugée périmée. Arrêt avant l'entraînement.")
if entr != attendu_entr or val != attendu_val:
    raise SystemExit("les blocs de villa ne sont pas ceux de la liste. Arrêt avant l'entraînement.")
print("la liste est prise telle quelle")
