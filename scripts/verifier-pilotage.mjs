// Vérifie la cohérence du carnet de recherche. Lancé par « npm run verifier » et par la CI.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chargerEtat } from '../ihm/lib/pilotage.mjs';

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { pistes, taches, horizon, fiches, executions, avancees, erreurs } = await chargerEtat(racine);

console.log(`${pistes.length} pistes, ${taches.length} tâches, ${horizon.livrables.length} livrables projetés, ${fiches.length} fiches, ${executions.length} exécutions, ${Object.values(avancees).reduce((n, d) => n + d.avancees.length, 0)} avancées.`);
if (erreurs.length) {
  console.error(`\n${erreurs.length} incohérence(s) :`);
  for (const e of erreurs) console.error(`  - ${e}`);
  process.exit(1);
}
console.log('Carnet cohérent.');
