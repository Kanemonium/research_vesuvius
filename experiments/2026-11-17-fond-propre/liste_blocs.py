"""X-014 : écrire une liste de blocs faite des anciens blocs d'entraînement et de ceux des carrés de fond.

Usage : python3 liste_blocs.py <liste complète.json> <ancienne liste.json> <candidats.json> <choix.json> <sortie.json>

Le script est le nôtre. Les deux listes lues sont celles que ScrollPrize/villa (licence MIT,
https://github.com/ScrollPrize/villa) a écrites : la complète pour le réglage à 0 (X-013), l'ancienne
pour le réglage à 0,05 (X-012). Aucun bloc n'est inventé : chaque ligne gardée est recopiée de la liste
complète, dans son ordre.
"""
import json
import sys

complete, ancienne, candidats, choix, sortie = sys.argv[1:6]

carres = {c["numero"]: c for c in json.load(open(candidats))["carres"]}
fond = [carres[n] for n in json.load(open(choix))["fond"]]


def dans_un_carre(bbox):
    _, y0, x0, _, y1, x1 = bbox
    return any(
        y0 < c["ligne"] + c["cote"] and y1 > c["ligne"] and x0 < c["colonne"] + c["cote"] and x1 > c["colonne"]
        for c in fond
    )


anciens = {tuple(r["bbox"]) for r in json.load(open(ancienne)) if not r["is_validation"]}
gardes, compte = [], {"validation": 0, "anciens": 0, "carres": 0, "ecartes": 0}
for bloc in json.load(open(complete)):
    if bloc["is_validation"]:
        genre = "validation"
    elif tuple(bloc["bbox"]) in anciens:
        genre = "anciens"
    elif dans_un_carre(bloc["bbox"]):
        genre = "carres"
    else:
        genre = "ecartes"
    compte[genre] += 1
    if genre != "ecartes":
        gardes.append(bloc)

if compte["anciens"] != len(anciens):
    raise SystemExit(f"{len(anciens) - compte['anciens']} anciens blocs manquent dans la liste complète : rien n'est écrit")
json.dump(gardes, open(sortie, "w"))
print(f"liste écrite : {len(gardes)} blocs, dont {compte['anciens']} anciens, {compte['carres']} dans les carrés "
      f"de fond, {compte['validation']} de validation ; {compte['ecartes']} blocs peu encrés de l'ancienne zone écartés")
