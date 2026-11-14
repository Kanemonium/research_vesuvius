// Lecture, validation et écriture du carnet de recherche (dossier pilotage/).
// Le format est décrit dans pilotage/README.md.
import { appendFile, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { marked } from 'marked';
import YAML from 'yaml';

export const TYPES_PISTE = ['racine', 'domaine', 'piste', 'decision'];
export const STATUTS_PISTE = ['a-explorer', 'en-cours', 'validee', 'impasse'];
export const STATUTS_TACHE = ['a-faire', 'en-cours', 'bloquee', 'faite'];
export const CONFIANCES = ['faible', 'moyenne', 'forte'];
const ID_TACHE = /^T-\d{3,}$/;

/** Sépare l'en-tête YAML du corps Markdown. */
export function lireEntete(texte) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(texte);
  if (!m) throw new Error('en-tête YAML manquant');
  return { meta: YAML.parse(m[1]) ?? {}, corps: m[2] };
}

/** Découpe un corps Markdown en sections « ## Titre ». */
export function lireSections(corps) {
  const sections = [];
  let courante = null;
  for (const ligne of corps.split(/\r?\n/)) {
    const titre = /^##\s+(.+)$/.exec(ligne);
    if (titre) {
      courante = { titre: titre[1].trim(), md: '' };
      sections.push(courante);
    } else if (courante) {
      courante.md += `${ligne}\n`;
    }
  }
  return sections.map((s) => ({ titre: s.titre, md: s.md.trim(), html: marked.parse(s.md.trim()) }));
}

async function lireDossier(dossier) {
  const noms = (await readdir(dossier)).filter((n) => n.endsWith('.md')).sort();
  return Promise.all(noms.map(async (nom) => {
    const fichier = path.join(dossier, nom);
    return { fichier, nom, ...lireEntete(await readFile(fichier, 'utf8')) };
  }));
}

/** Charge tout le carnet et renvoie aussi la liste des incohérences trouvées. */
export async function chargerEtat(racine) {
  const base = path.join(racine, 'pilotage');
  const erreurs = [];

  const pistes = (await lireDossier(path.join(base, 'pistes'))).map(({ meta, corps, nom }) => ({
    ...meta, parent: meta.parent ?? null, prix: meta.prix ?? [], fichier: `pilotage/pistes/${nom}`,
    sections: lireSections(corps),
  }));
  const taches = (await lireDossier(path.join(base, 'taches'))).map(({ meta, corps, nom }) => ({
    ...meta, fichier: `pilotage/taches/${nom}`, note: corps.trim(), noteHtml: marked.parse(corps.trim()),
  }));
  const horizon = YAML.parse(await readFile(path.join(base, 'horizon.yaml'), 'utf8')) ?? {};
  for (const cle of ['prix', 'echeances', 'problemes', 'livrables']) horizon[cle] ??= [];
  const fiches = await chargerFiches(racine, erreurs);

  // Identifiants uniques.
  const vus = new Map();
  const tous = [...pistes, ...taches, ...horizon.livrables, ...horizon.problemes, ...fiches];
  for (const e of tous) {
    if (!e.id) erreurs.push(`${e.fichier ?? 'horizon.yaml'} : identifiant manquant`);
    else if (vus.has(e.id)) erreurs.push(`${e.id} : identifiant en double`);
    vus.set(e.id, e);
  }
  const idsPistes = new Set(pistes.map((p) => p.id));
  const idsPrix = new Set(horizon.prix.map((p) => p.id));
  const idsProblemes = new Set(horizon.problemes.map((p) => p.id));

  // Pistes : valeurs permises, un seul sommet, parents existants, pas de boucle.
  const racines = pistes.filter((p) => p.type === 'racine');
  if (racines.length !== 1) erreurs.push(`il faut exactement une piste de type « racine » (trouvé : ${racines.length})`);
  const parId = new Map(pistes.map((p) => [p.id, p]));
  for (const p of pistes) {
    if (!TYPES_PISTE.includes(p.type)) erreurs.push(`${p.id} : type « ${p.type} » inconnu`);
    if (!STATUTS_PISTE.includes(p.statut)) erreurs.push(`${p.id} : statut « ${p.statut} » inconnu`);
    if (!p.titre) erreurs.push(`${p.id} : titre manquant`);
    if (p.type === 'racine') {
      if (p.parent) erreurs.push(`${p.id} : la racine ne peut pas avoir de parent`);
      continue;
    }
    if (!idsPistes.has(p.parent)) { erreurs.push(`${p.id} : parent « ${p.parent} » introuvable`); continue; }
    const chemin = new Set([p.id]);
    for (let n = parId.get(p.parent); n; n = parId.get(n.parent)) {
      if (chemin.has(n.id)) { erreurs.push(`${p.id} : boucle dans les parents`); break; }
      chemin.add(n.id);
    }
    for (const prix of p.prix) if (!idsPrix.has(prix)) erreurs.push(`${p.id} : prix « ${prix} » inconnu`);
  }

  for (const t of taches) {
    if (!ID_TACHE.test(t.id ?? '')) erreurs.push(`${t.fichier} : identifiant de tâche invalide`);
    if (!STATUTS_TACHE.includes(t.statut)) erreurs.push(`${t.id} : statut « ${t.statut} » inconnu`);
    if (!idsPistes.has(t.piste)) erreurs.push(`${t.id} : piste « ${t.piste} » introuvable`);
  }

  for (const f of horizon.problemes) {
    if (f.piste && !idsPistes.has(f.piste)) erreurs.push(`${f.id} : piste « ${f.piste} » introuvable`);
  }
  for (const l of horizon.livrables) {
    l.repond_a ??= []; l.prix ??= [];
    if (!idsPistes.has(l.piste)) erreurs.push(`${l.id} : piste « ${l.piste} » introuvable`);
    if (!CONFIANCES.includes(l.confiance)) erreurs.push(`${l.id} : confiance « ${l.confiance} » inconnue`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(l.fenetre))) erreurs.push(`${l.id} : fenêtre « ${l.fenetre} » invalide`);
    for (const f of l.repond_a) if (!idsProblemes.has(f)) erreurs.push(`${l.id} : problème « ${f} » introuvable`);
    for (const p of l.prix) if (!idsPrix.has(p)) erreurs.push(`${l.id} : prix « ${p} » inconnu`);
  }
  for (const e of horizon.echeances) {
    if (!idsPrix.has(e.prix)) erreurs.push(`${e.id} : prix « ${e.prix} » inconnu`);
  }

  for (const f of fiches) {
    for (const id of f.pistes) if (!idsPistes.has(id)) erreurs.push(`${f.id} : piste « ${id} » introuvable`);
  }

  return { pistes, taches, horizon, fiches, erreurs };
}

const LANGUES = ['fr', 'en'];

/** Fiches de docs/concepts/ : un fichier par langue, regroupés par identifiant. */
async function chargerFiches(racine, erreurs) {
  const dossier = path.join(racine, 'docs', 'concepts');
  let noms = [];
  try { noms = (await readdir(dossier)).filter((n) => /\.(fr|en)\.md$/.test(n)).sort(); } catch { return []; }
  const parId = new Map();
  for (const nom of noms) {
    const { meta, corps } = lireEntete(await readFile(path.join(dossier, nom), 'utf8'));
    const lg = meta.langue;
    if (!LANGUES.includes(lg)) { erreurs.push(`${nom} : langue « ${lg} » inconnue`); continue; }
    const alt = /!\[([^\]]*)\]/.exec(corps)?.[1] ?? '';
    const fiche = parId.get(meta.id) ?? { id: meta.id, domaine: meta.domaine, ordre: meta.ordre ?? 99, pistes: meta.pistes ?? [], image: meta.image, source: meta.source };
    fiche[lg] = { titre: meta.titre, resume: meta.resume, alt, sections: lireSections(corps), fichier: `docs/concepts/${nom}` };
    parId.set(meta.id, fiche);
  }
  const fiches = [...parId.values()].sort((a, b) => a.ordre - b.ordre);
  for (const f of fiches) {
    for (const lg of LANGUES) if (!f[lg]) erreurs.push(`${f.id} : version « ${lg} » manquante`);
    if (!/^K-\d{2,3}$/.test(f.id ?? '')) erreurs.push(`fiche « ${f.id} » : identifiant invalide`);
    try { await stat(path.join(dossier, f.image ?? '')); if (!f.image) throw new Error(); } catch { erreurs.push(`${f.id} : planche « ${f.image} » introuvable`); }
  }
  return fiches.filter((f) => f.fr && f.en);
}

/** Empreinte du carnet : change dès qu'un fichier est ajouté, retiré ou modifié. */
export async function empreinte(racine) {
  const base = path.join(racine, 'pilotage');
  const fichiers = [path.join(base, 'horizon.yaml'), path.join(base, 'boite.md')];
  for (const d of ['pistes', 'taches']) for (const n of await readdir(path.join(base, d))) fichiers.push(path.join(base, d, n));
  try {
    const concepts = path.join(racine, 'docs', 'concepts');
    for (const n of await readdir(concepts)) if (n.endsWith('.md')) fichiers.push(path.join(concepts, n));
  } catch { /* pas encore de fiches */ }
  const dates = await Promise.all(fichiers.map(async (f) => (await stat(f)).mtimeMs));
  return `${fichiers.length}-${Math.round(Math.max(...dates))}`;
}

/** Change le statut d'une tâche en ne touchant qu'à la ligne « statut: » de son en-tête. */
export async function changerStatutTache(racine, id, statut) {
  if (!ID_TACHE.test(id)) throw new Error('identifiant de tâche invalide');
  if (!STATUTS_TACHE.includes(statut)) throw new Error('statut inconnu');
  const dossier = path.join(racine, 'pilotage', 'taches');
  const nom = (await readdir(dossier)).find((n) => n.startsWith(`${id}-`) && n.endsWith('.md'));
  if (!nom) throw new Error(`tâche ${id} introuvable`);
  const fichier = path.join(dossier, nom);
  const texte = await readFile(fichier, 'utf8');
  const fin = texte.indexOf('\n---', 3);
  const entete = texte.slice(0, fin);
  if (!/^statut:.*$/m.test(entete)) throw new Error(`${id} : ligne « statut: » absente`);
  await writeFile(fichier, entete.replace(/^statut:.*$/m, `statut: ${statut}`) + texte.slice(fin), 'utf8');
}

/** Ajoute un message dans la boîte d'Agent C., sous « À lire ». */
export async function deposerMessage(racine, texte, maintenant = new Date()) {
  const propre = String(texte ?? '').replace(/\r/g, '').trim();
  if (!propre) throw new Error('message vide');
  if (propre.length > 4000) throw new Error('message trop long (4000 caractères au plus)');
  const fichier = path.join(racine, 'pilotage', 'boite.md');
  const horodatage = maintenant.toISOString().slice(0, 16).replace('T', ' ');
  const bloc = `- **${horodatage}** : ${propre.replace(/\n+/g, '\n  ')}\n`;
  const contenu = await readFile(fichier, 'utf8');
  const repere = '## Traités';
  if (!contenu.includes(repere)) return appendFile(fichier, `\n${bloc}`, 'utf8');
  const [avant, apres] = contenu.split(repere);
  await writeFile(fichier, `${avant.trimEnd()}\n${avant.trimEnd().endsWith('## À lire') ? '\n' : ''}${bloc}\n${repere}${apres}`, 'utf8');
}

/** Messages en attente dans la boîte (section « À lire »). */
export async function lireBoite(racine) {
  const contenu = await readFile(path.join(racine, 'pilotage', 'boite.md'), 'utf8');
  const section = contenu.split('## À lire')[1]?.split('## Traités')[0] ?? '';
  return section.split(/\n(?=- \*\*)/).map((s) => s.trim()).filter((s) => s.startsWith('- **'))
    .map((s) => s.replace(/^- /, ''));
}
