// Les avancées d'un domaine : ce que le défi tout entier (équipe et communauté) a franchi sur le
// scan, le dépliage et l'encre, et ce que nous avons franchi nous-mêmes sur le pilotage et les outils.
// Un fichier par domaine dans pilotage/avancees/<domaine>.yaml ; le format est dans pilotage/README.md.
// Chaque avancée d'un domaine « communauté » cite au moins une source : rien n'y figure de mémoire.
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { marked } from 'marked';
import YAML from 'yaml';

export const STATUTS_AVANCEE = ['acquis', 'en-cours', 'ouvert'];
export const PORTEES = ['communaute', 'nous'];
const liste = (v) => (Array.isArray(v) ? v : []);
const html = (v) => (v ? marked.parse(String(v)) : '');

export async function fichiersAvancees(racine) {
  const dossier = path.join(racine, 'pilotage', 'avancees');
  try {
    return (await readdir(dossier)).filter((n) => n.endsWith('.yaml')).sort().map((n) => path.join(dossier, n));
  } catch {
    return [];
  }
}

/** Les avancées, rangées par domaine. « connus » sert à vérifier les renvois vers pistes, fiches et exécutions. */
export async function chargerAvancees(racine, erreurs = [], connus = new Set()) {
  const domaines = {};
  const vus = new Set();
  for (const fichier of await fichiersAvancees(racine)) {
    const nom = path.basename(fichier);
    let brut;
    try { brut = YAML.parse(await readFile(fichier, 'utf8')) ?? {}; } catch (e) { erreurs.push(`${nom} : YAML illisible (${e.message})`); continue; }
    const domaine = brut.domaine ?? nom.replace(/\.yaml$/, '');
    const portee = brut.portee ?? 'communaute';
    if (!PORTEES.includes(portee)) erreurs.push(`${nom} : portée inconnue « ${portee} »`);
    const branches = liste(brut.branches).map((b) => ({ id: String(b.id ?? ''), titre: b.titre ?? '' }));
    const avancees = liste(brut.avancees).map((a) => {
      if (!/^A-\d{3}$/.test(a.id ?? '')) erreurs.push(`${nom} : identifiant d'avancée invalide « ${a.id} »`);
      else if (vus.has(a.id)) erreurs.push(`${nom} : identifiant ${a.id} en double`);
      vus.add(a.id);
      if (!a.titre) erreurs.push(`${a.id} : avancée sans titre`);
      if (!STATUTS_AVANCEE.includes(a.statut)) erreurs.push(`${a.id} : statut inconnu « ${a.statut} »`);
      if (branches.length && !branches.some((b) => b.id === a.branche)) erreurs.push(`${a.id} : branche inconnue « ${a.branche} »`);
      const sources = liste(a.sources);
      // Ce que nous disons du travail des autres doit pouvoir être retrouvé.
      if (portee === 'communaute' && !a.nous && !sources.some((s) => /^https:\/\//.test(s?.lien ?? ''))) erreurs.push(`${a.id} : avancée de la communauté sans source`);
      for (const id of [...liste(a.fiches), ...liste(a.pistes), ...liste(a.executions)]) {
        if (connus.size && !connus.has(id)) erreurs.push(`${a.id} : renvoie vers ${id}, qui n'existe pas`);
      }
      return {
        id: a.id, branche: a.branche ?? '', date: a.date ? String(a.date) : null, noteDate: a.note_date ?? null, titre: a.titre ?? '', statut: a.statut, nous: Boolean(a.nous) || portee === 'nous',
        resume: a.resume ?? '', fonctionnelHtml: html(a.fonctionnel), techniqueHtml: html(a.technique),
        qui: liste(a.qui), prix: a.prix ?? null, sources,
        fiches: liste(a.fiches), pistes: liste(a.pistes), executions: liste(a.executions),
      };
    });
    domaines[domaine] = { domaine, portee, branches, resumeHtml: html(brut.resume), lu_le: brut.lu_le ? String(brut.lu_le) : null, fichier: `pilotage/avancees/${nom}`, avancees };
  }
  return domaines;
}

const DOMAINES_PRIX = ['scan', 'depliage', 'encre', 'outils', 'autre'];
export const fichierPrix = (racine) => path.join(racine, 'pilotage', 'prix-attribues.yaml');
/** Montant en dollars d'un texte comme « $20,000 », ou 0 s'il n'y a pas de montant. */
export const dollars = (texte) => Number(String(texte ?? '').replace(/[^\d]/g, '')) || 0;

/** Tous les prix attribués par le défi (pilotage/prix-attribues.yaml), section par section. */
export async function chargerPrix(racine, erreurs = []) {
  let brut;
  try { brut = YAML.parse(await readFile(fichierPrix(racine), 'utf8')) ?? {}; } catch (e) {
    if (e.code !== 'ENOENT') erreurs.push(`prix-attribues.yaml : illisible (${e.message})`);
    return { lu_le: null, source: null, sections: [] };
  }
  const sections = liste(brut.sections).map((s) => ({
    titre: s.titre ?? '', date: s.date ? String(s.date) : null, total: s.total ?? null, but: s.but ?? null,
    laureats: liste(s.laureats).map((l) => {
      if (!DOMAINES_PRIX.includes(l.domaine)) erreurs.push(`prix « ${s.titre} » : domaine inconnu « ${l.domaine} »`);
      return { qui: l.qui ?? '', montant: l.montant ?? null, dollars: dollars(l.montant), intitule: l.intitule ?? null, quoi: l.quoi ?? '', domaine: l.domaine };
    }),
  }));
  if (sections.length && !/^https:\/\//.test(brut.source?.lien ?? '')) erreurs.push('prix-attribues.yaml : source manquante');
  return { lu_le: brut.lu_le ? String(brut.lu_le) : null, source: brut.source ?? null, sections };
}
