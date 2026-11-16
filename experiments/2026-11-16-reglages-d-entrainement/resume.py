"""Tableau de l'essai X-007 : ce que la mesure intégrée de villa a relevé pour chaque variante.

Lit runs/essai_chargement_<nom>/benchmark_summary.json, écrit par le programme d'entraînement de
ScrollPrize/villa (licence MIT) quand « benchmark » est activé.

Usage : python3 resume.py <dossier runs> <nom:processus> [<nom:processus> …]
"""

import json
import sys
from pathlib import Path

if __name__ == "__main__":
    if len(sys.argv) < 3:
        raise SystemExit(__doc__)
    for variante in sys.argv[2:]:
        nom, processus = variante.split(":")
        fichier = Path(sys.argv[1]) / f"essai_chargement_{nom}" / "benchmark_summary.json"
        if not fichier.exists():
            print(f"{nom} ({processus} processus) : pas de mesure")
            continue
        m = json.loads(fichier.read_text(encoding="utf-8"))
        pas = 1 / m["steps_per_second"]
        attente = m["data_wait_seconds_per_step"]
        print(
            f"{nom} ({processus} processus) : {m['measured_steps']} itérations mesurées ; "
            f"{pas:.3f} s par itération, dont {attente:.3f} s à attendre les données "
            f"({100 * attente / pas:.0f} %) ; "
            f"pic alloué {m['peak_allocated_bytes'] / 2**20:.0f} Mo, "
            f"réservé {m['peak_reserved_bytes'] / 2**20:.0f} Mo"
        )
