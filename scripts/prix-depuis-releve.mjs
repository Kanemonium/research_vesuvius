// Écrit pilotage/prix-attribues.yaml à partir d'un relevé de la page des lauréats de scrollprize.org.
//
//   node scripts/prix-depuis-releve.mjs <relevé.json> <dossier des pages lues>
//
// Le relevé (fait le 2026-11-15 sur scrollprize.org/docs/15_winners.md de ScrollPrize/villa, commit
// 2d3fb38) donne, pour chaque lauréat, ce qui a été récompensé et une citation de la page. Ce script
// refuse d'écrire si une seule citation ne se retrouve pas mot pour mot dans la page. Les citations
// ne sont pas recopiées. Le rangement par domaine est le nôtre : la page ne classe pas ainsi.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COMMIT = '2d3fb38d33a18b257230c0bd23986436c3d4722e';
const PAGE = '15_winners.md';
const [fichierReleve, dossierPages] = process.argv.slice(2);
if (!fichierReleve || !dossierPages) throw new Error('usage : prix-depuis-releve.mjs <relevé.json> <dossier des pages>');
const releve = JSON.parse(await readFile(fichierReleve, 'utf8'));
const page = (await readFile(path.join(dossierPages, PAGE), 'utf8')).replace(/\s+/g, ' ');
const DOMAINES = ['scan', 'depliage', 'encre', 'outils', 'autre'];

let citations = 0;
const sections = [];
for (const s of releve.sections) {
  // « EduceLab tools » figure sur la page sans date ni montant : ce n'est pas un prix.
  if (!s.total) continue;
  const laureats = s.laureats.map((l) => {
    citations += 1;
    if (!page.includes(l.citation.replace(/\s+/g, ' '))) throw new Error(`citation introuvable : « ${l.citation.slice(0, 80)} »`);
    if (!DOMAINES.includes(l.domaine)) throw new Error(`domaine inconnu « ${l.domaine} » pour ${l.qui}`);
    return { qui: l.qui, montant: l.montant ?? null, intitule: l.intitule ?? null, quoi: l.quoi_fr, domaine: l.domaine };
  });
  sections.push({ titre: s.section.replace(/^\$[\d,]+\s+/, ''), date: s.date ?? null, total: s.total, ...(s.but ? { but: s.but } : {}), laureats });
}
sections.sort((a, b) => String(b.date).localeCompare(String(a.date)));

const doc = {
  lu_le: '2026-11-15',
  source: { titre: 'scrollprize.org · winners', lien: `https://github.com/ScrollPrize/villa/blob/${COMMIT}/scrollprize.org/docs/${PAGE}` },
  sections,
};
const entete = `# Tous les prix attribués par le défi, d'après sa page des lauréats. Format : pilotage/README.md.\n# Écrit par scripts/prix-depuis-releve.mjs (ScrollPrize/villa, commit ${COMMIT.slice(0, 7)}, licence MIT).\n# Textes français et rangement par domaine : Agent C., pas une traduction officielle.\n`;
await writeFile(path.join(RACINE, 'pilotage', 'prix-attribues.yaml'), entete + YAML.stringify(doc, { lineWidth: 110 }), 'utf8');
console.log(`${sections.length} sections, ${sections.reduce((n, s) => n + s.laureats.length, 0)} lauréats ; ${citations} citations retrouvées mot pour mot.`);
