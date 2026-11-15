// Écrit pilotage/avancees/{scan,depliage,encre}.yaml à partir d'un relevé des pages de scrollprize.org.
//
//   node scripts/avancees-depuis-releve.mjs local/releves/avancees.json local/releves/pages
//
// Le relevé et les pages lues sont gardés dans local/releves/ (ignoré par git).
//
// Le relevé (fait le 2026-11-15 sur la documentation de ScrollPrize/villa, commit 2d3fb38) donne pour
// chaque avancée un texte français et des citations anglaises tirées des pages. Ce script refuse
// d'écrire si une seule citation ne se retrouve pas mot pour mot dans sa page : rien n'entre dans le
// carnet qui ne soit adossé à une source. Les citations elles-mêmes ne sont pas recopiées ; chaque
// avancée renvoie vers ses pages. Nos propres pas, eux, sont ajoutés ici à la main.
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const COMMIT = '2d3fb38d33a18b257230c0bd23986436c3d4722e';
const [fichierReleve, dossierPages] = process.argv.slice(2);
if (!fichierReleve || !dossierPages) throw new Error('usage : avancees-depuis-releve.mjs <relevé.json> <dossier des pages>');
const releve = JSON.parse(await readFile(fichierReleve, 'utf8'));

// 1. Toutes les citations doivent exister dans leur page.
const pages = new Map();
const page = async (f) => pages.get(f) ?? pages.set(f, (await readFile(path.join(dossierPages, f), 'utf8')).replace(/\s+/g, ' ')).get(f);
let citations = 0;
async function verifier(o) {
  if (Array.isArray(o)) { for (const e of o) await verifier(e); return; }
  if (!o || typeof o !== 'object') return;
  if (o.fichier && o.citation) {
    citations += 1;
    if (!(await page(o.fichier)).includes(o.citation.replace(/\s+/g, ' '))) throw new Error(`citation introuvable dans ${o.fichier} : « ${o.citation.slice(0, 80)} »`);
  }
  for (const v of Object.values(o)) await verifier(v);
}
await verifier(releve);

// 2. Renvois vers nos fiches et nos pistes, par position dans le relevé (les titres peuvent bouger).
const RENVOIS = {
  scan: { fiches: { 0: ['K-03'], 2: ['K-03'], 5: ['K-04'], 6: ['K-04', 'K-05'], 7: ['K-05'], 8: ['K-04'], 9: ['K-04'], 10: ['K-10'] }, pistes: {} },
  depliage: {
    fiches: { 0: ['K-06'], 1: ['K-06'], 4: ['K-06'], 10: ['K-07'], 11: ['K-06'], 12: ['K-06'] },
    pistes: { 6: ['P-220'], 8: ['P-210'], 11: ['P-240'], 13: ['P-230'], 14: ['P-250'] },
  },
  encre: {
    fiches: { 0: ['K-02', 'K-19'], 1: ['K-19'], 2: ['K-18', 'K-07'], 3: ['K-18', 'K-09', 'K-24'], 4: ['K-21', 'K-25', 'K-16'], 5: ['K-22'], 7: ['K-20', 'K-18'], 8: ['K-09', 'K-24', 'K-16'], 9: ['K-22', 'K-23'], 10: ['K-18', 'K-04'], 11: ['K-20', 'K-12'], 13: ['K-20', 'K-22'] },
    pistes: { 5: ['P-330'], 7: ['P-320'], 9: ['P-330', 'P-340'], 11: ['P-320', 'P-310'], 13: ['P-320', 'P-250'] },
  },
};
const NOUS = {
  encre: [
    {
      id: 'A-381', branche: 'nous', date: '2026-11-14', titre: 'Notre ligne de base : le modèle du tutoriel entraîné chez nous', statut: 'acquis', nous: true,
      resume: "Le modèle du tutoriel d'encre entraîné jusqu'au bout sur notre ordinateur portable, avec des blocs plus petits que ceux du tutoriel.",
      fonctionnel: "Nous avons un point de départ à nous pour comprendre la chaîne. Il ne vaut que pour le segment du tutoriel, et sa qualité n'est pas encore regardée.",
      technique: 'U-Net 3D de villa, blocs de 128, 20 000 itérations. Détail dans X-002.',
      pistes: ['P-310', 'P-420'], executions: ['X-002'], fiches: ['K-11', 'K-12'],
    },
    {
      id: 'A-382', branche: 'nous', date: '2026-11-15', titre: "Notre première image d'encre, sur le segment du tutoriel", statut: 'acquis', nous: true,
      resume: "Une image d'encre du segment entier, où des formes claires s'alignent en rangées. Pas une preuve : ce segment a servi à l'entraînement.",
      fonctionnel: "La chaîne fonctionne chez nous de bout en bout. Comparée aux étiquettes, l'image montre des formes de lettres aussi hors de la zone corrigée (5,8 % de l'image) : le modèle ne fait pas que réciter. Mais il sépare mal l'encre du fond. Aucune lettre n'est identifiée.",
      technique: 'Exécution X-003 : 5 h 34 min, 346 481 blocs. Réponse médiane de 201 sur 255 sur l’encre étiquetée, de 129 sur le fond étiqueté. Aucune région tenue à l’écart : la mesure sur données jamais vues reste à faire.',
      pistes: ['P-310'], executions: ['X-003'], fiches: ['K-08', 'K-16', 'K-21', 'K-26'],
    },
  ],
};
const RESUMES = {
  scan: 'Comment les rouleaux sont scannés et mis à disposition : du premier scan de 2019 aux acquisitions de l’ESRF. Le défi tout entier, lu dans les pages de scrollprize.org.',
  depliage: 'Comment on retrouve la feuille de papyrus dans le scan et comment on l’aplatit : du tracé à la main aux méthodes automatiques. Le défi tout entier, lu dans les pages de scrollprize.org.',
  encre: 'Comment on fait apparaître une encre presque invisible aux rayons X : des fragments ouverts aux premiers rouleaux lus, et ce qui résiste encore. Le défi tout entier, lu dans les pages de scrollprize.org ; nos propres pas y figurent à leur date.',
};
// Corrections décidées en relisant un nœud avec Kanemonium, la source ouverte à côté. Elles priment sur le relevé.
const CORRECTIONS = {
  encre: {
    // 2026-11-15 : la source dit « do not appear to generalize » ; le relevé avait effacé cette prudence.
    7: { resume: "Les percées de 2023 et 2024 ne semblent pas se généraliser à toute la collection ; dans les nouvelles données de l'équipe, l'encre reste insaisissable à cette date." },
    // 2026-11-15 : le relevé mêlait à ce nœud l'expérience des agents, qui vient d'une autre page. Elle a son propre nœud (AJOUTS).
    11: {
      titre: 'Modèles pré-entraînés multi-rouleaux à 9 µm',
      fonctionnel: "On peut partir de la seule géométrie d'un segment, le rendre, appliquer les modèles partagés et regarder. Le modèle courant à 2,4 µm est ink_canonical_2um.",
      technique: "Modèles scrollprize/ink_9um : petite tête 3D suivie d'un U-Net 2D (hybride 3D vers 2D), sur un patch de 17 tranches ; étiquettes alignées de PHerc. 0139, PHerc. 1667, PHerc. Paris. 4 et PHerc. 0814 à environ 9 µm isotrope ; deux graines (42 et 43), sept points de contrôle chacun. Recette : 24 segments annotés sur rendus 2,4 µm regroupés et 5 sur rendus natifs 9,362 µm, quotas par rouleau fixes par lot (29/22/11/2 sur 64), lissage d'étiquettes 0,5. Entraînement complet : 78 125 itérations, environ cinq heures sur un H100.",
    },
  },
};
// Nœuds ajoutés à la relecture, placés après la position indiquée du relevé. Leur citation est vérifiée comme les autres.
const AJOUTS = {
  encre: [
    {
      apres: 11,
      noeud: {
        id: 'A-315', branche: 'generalisation', date: '2026', titre: "Des agents trouvent un réglage qui passe mieux d'un rouleau à l'autre", statut: 'en-cours', relu: true,
        resume: "Des agents tournant en continu ont trouvé une configuration qui a presque doublé le Dice de validation sur PHerc. 1667, en ne s'entraînant que sur PHerc. 139. Ce score est calculé sur des pseudo-étiquettes ; l'équipe y voit une amélioration réelle de la généralisation entre rouleaux.",
        fonctionnel: "C'est le premier progrès rapporté sur le passage d'un rouleau à un autre. Deux réserves : la mesure s'appuie sur des étiquettes issues d'un modèle, pas sur une vérité terrain, et aucune valeur absolue n'est donnée.",
        technique: "Système d'agents adapté en interne d'un projet public paru en mars 2026, appliqué aux architectures de modèles d'encre. Entraînement sur les seules données de PHerc. 139, validation sur PHerc. 1667.",
        note_date: "La page ne date pas l'expérience : elle est postérieure à mars 2026, et la page est du 14 octobre 2026.",
        qui: ['Vesuvius Challenge'], fiches: ['K-20', 'K-26', 'K-09'], pistes: ['P-320'],
      },
      preuves: [{ fichier: '37_2026_open_problems.md', citation: 'the system found a configuration that nearly doubled the validation Dice score (computed on pseudo-labels) on PHerc. 1667 while training only on PHerc. 139 data' }],
    },
  ],
};
await verifier(Object.values(AJOUTS).flat().map((a) => a.preuves));
const BASES = { scan: 100, depliage: 200, encre: 300 };
// Les branches de chaque parcours (ses sous-sujets), et la branche de chaque avancée, par position dans le relevé.
// Ce rangement est le nôtre : les pages du défi ne découpent pas ainsi.
const BRANCHES = {
  scan: {
    liste: [{ id: 'acquisitions', titre: 'Scanner des rouleaux' }, { id: 'reglages', titre: 'Réglages et reconstruction' }, { id: 'resolution', titre: 'Plus fin que 2,4 µm' }, { id: 'donnees', titre: 'Données ouvertes' }],
    de: ['acquisitions', 'acquisitions', 'donnees', 'reglages', 'acquisitions', 'reglages', 'reglages', 'reglages', 'resolution', 'resolution', 'donnees', 'resolution'],
  },
  depliage: {
    liste: [{ id: 'jalons', titre: 'Rouleaux déroulés' }, { id: 'outils', titre: 'Tracer à la main, outiller' }, { id: 'automatique', titre: 'Méthodes automatiques' }, { id: 'surface', titre: 'Surface et aplatissement' }],
    de: ['jalons', 'outils', 'outils', 'outils', 'automatique', 'automatique', 'outils', 'automatique', 'surface', 'automatique', 'surface', 'automatique', 'jalons', 'automatique', 'automatique'],
  },
  encre: {
    liste: [{ id: 'signal', titre: "Le signal d'encre" }, { id: 'lectures', titre: 'Lire des rouleaux' }, { id: 'volume', titre: "L'encre en volume" }, { id: 'generalisation', titre: "D'un rouleau à l'autre" }, { id: 'nous', titre: 'Notre parcours' }],
    de: ['signal', 'lectures', 'signal', 'lectures', 'lectures', 'volume', 'lectures', 'generalisation', 'lectures', 'volume', 'signal', 'generalisation', 'lectures', 'generalisation'],
  },
};
const titrePage = (f) => `scrollprize.org · ${f.replace(/^\d+_/, '').replace(/\.mdx?$/, '').replace(/_/g, ' ')}`;

for (const domaine of Object.keys(BASES)) {
  const avancees = releve[domaine].map((n, i) => {
    const fichiers = [...new Set(n.sources.map((s) => s.fichier))];
    const a = {
      id: `A-${BASES[domaine] + i + 1}`, branche: BRANCHES[domaine].de[i], date: n.date ?? null, titre: n.titre, statut: n.statut,
      resume: n.resume, fonctionnel: n.fonctionnel, technique: n.technique,
    };
    Object.assign(a, CORRECTIONS[domaine]?.[i] ?? {});
    if (CORRECTIONS[domaine]?.[i]) a.relu = true;
    if (n.date_note) a.note_date = n.date_note;
    if (n.qui?.length) a.qui = n.qui;
    if (n.prix) a.prix = { nom: n.prix.nom, montant: n.prix.montant };
    const { fiches, pistes } = RENVOIS[domaine];
    if (fiches[i]) a.fiches = fiches[i];
    if (pistes[i]) a.pistes = pistes[i];
    a.sources = fichiers.map((f) => ({ titre: titrePage(f), lien: `https://github.com/ScrollPrize/villa/blob/${COMMIT}/scrollprize.org/docs/${f}` }));
    return a;
  });
  for (const { apres, noeud, preuves } of [...(AJOUTS[domaine] ?? [])].sort((a, b) => b.apres - a.apres)) {
    const sources = [...new Set(preuves.map((s) => s.fichier))].map((f) => ({ titre: titrePage(f), lien: `https://github.com/ScrollPrize/villa/blob/${COMMIT}/scrollprize.org/docs/${f}` }));
    avancees.splice(apres + 1, 0, { ...noeud, sources });
  }
  // Pour l'encre, la vue d'ensemble reprend l'état des lieux du relevé : ce qui est acquis, ce qui résiste.
  const etat = domaine === 'encre' ? releve.etat_de_l_art : null;
  const puces = (l) => l.map((e) => `- ${e.texte}`).join('\n');
  const resume = etat
    ? [RESUMES[domaine], '**Ce qui est acquis**', puces(etat.reussites), '**Ce qui résiste**', puces(etat.blocages)].join('\n\n')
    : RESUMES[domaine];
  const doc = { domaine, portee: 'communaute', lu_le: '2026-11-15', resume, branches: BRANCHES[domaine].liste, avancees: [...avancees, ...(NOUS[domaine] ?? [])] };
  const entete = `# Parcours du domaine « ${domaine} » : le défi tout entier. Format : pilotage/README.md.\n# Écrit par scripts/avancees-depuis-releve.mjs à partir des pages de scrollprize.org (ScrollPrize/villa,\n# commit ${COMMIT.slice(0, 7)}, licence MIT). Textes français : reformulation d'Agent C., pas une traduction officielle.\n`;
  await writeFile(path.join(RACINE, 'pilotage', 'avancees', `${domaine}.yaml`), entete + YAML.stringify(doc, { lineWidth: 110 }), 'utf8');
  console.log(`${domaine} : ${doc.avancees.length} avancées`);
}
console.log(`${citations} citations retrouvées mot pour mot.`);
