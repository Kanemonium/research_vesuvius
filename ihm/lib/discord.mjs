// Le tiroir Discord de l'IHM. Il ne parle jamais à Discord : il montre le fichier local que
// Agent C. écrit après une lecture faite à la demande de Kanemonium, dans son navigateur.
// Ce fichier (local/discord/lecture.json) contient les messages d'autres personnes : il est
// ignoré par git et ne doit jamais entrer dans le dépôt public.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { marked } from 'marked';

export const PROBLEMES = { encre: "L'encre", deroulement: 'Le déroulement' };
/** Au-delà de ce délai sans lecture, l'IHM le signale dans la barre du haut. */
export const DELAI_HEURES = 8;

const liste = (v) => (Array.isArray(v) ? v : []);

/** Nos réponses s'insèrent dans le fil d'actualité de leur problème, à leur date. */
function fil(actu, reponses, probleme) {
  const notres = reponses.filter((r) => r.probleme === probleme).map((r) => ({ ...r, nous: true }));
  return [...liste(actu), ...notres].sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

/** Les règles de contribution de villa, résumées en français dans docs/contribuer-a-villa.md. */
async function regles(racine) {
  try {
    return marked.parse(await readFile(path.join(racine, 'docs', 'contribuer-a-villa.md'), 'utf8'));
  } catch {
    return '';
  }
}

export async function lireDiscord(racine, maintenant = new Date()) {
  const vide = {
    regles_html: await regles(racine), github_lu_le: null,
    lu_le: null, age_heures: null, a_relire: true, delai_heures: DELAI_HEURES, salons_lus: [], non_lu: '',
    problemes: Object.fromEntries(Object.entries(PROBLEMES).map(([cle, nom]) => [cle, { nom, synthese: [], actu: [] }])),
    pour_moi: [], pour_moi_note: '',
  };
  let brut;
  try {
    brut = JSON.parse(await readFile(path.join(racine, 'local', 'discord', 'lecture.json'), 'utf8'));
  } catch (e) {
    return e.code === 'ENOENT' ? vide : { ...vide, erreur: `lecture.json illisible : ${e.message}` };
  }
  const reponses = liste(brut.reponses);
  const lu = brut.lu_le ? new Date(brut.lu_le) : null;
  const age = lu && !Number.isNaN(lu.getTime()) ? (maintenant - lu) / 3_600_000 : null;
  return {
    regles_html: vide.regles_html,
    github_lu_le: brut.github_lu_le ?? null,
    lu_le: brut.lu_le ?? null,
    age_heures: age === null ? null : Math.max(0, Math.round(age * 10) / 10),
    a_relire: age === null || age >= DELAI_HEURES,
    delai_heures: DELAI_HEURES,
    salons_lus: liste(brut.salons_lus),
    non_lu: brut.non_lu ?? '',
    problemes: Object.fromEntries(Object.entries(PROBLEMES).map(([cle, nom]) => [cle, {
      nom,
      synthese: liste(brut.problemes?.[cle]?.synthese),
      actu: fil(brut.problemes?.[cle]?.actu, reponses, cle),
    }])),
    pour_moi: [...liste(brut.pour_moi), ...reponses.filter((r) => r.pour_moi).map((r) => ({ ...r, nous: true }))]
      .sort((a, b) => String(b.date).localeCompare(String(a.date))),
    pour_moi_note: brut.pour_moi_note ?? '',
  };
}
