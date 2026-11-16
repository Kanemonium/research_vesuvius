// Les réponses de Kanemonium aux questions posées sous les images d'une exécution.
// Agent C. écrit une assertion sur ce qu'il voit ; Kanemonium la confirme, l'infirme ou dit qu'il ne
// sait pas. Les réponses sont rangées à côté du journal, dans experiments/<dossier>/journaux/X-….reponses.json,
// et versionnées : c'est son regard, pas une donnée de rouleau.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const CHOIX = ['confirme', 'infirme', 'ne-sait-pas'];
const fichier = (racine, x) => path.join(racine, x.dossier, 'journaux', `${x.id}.reponses.json`);

export async function lireReponses(racine, x) {
  try {
    const brut = JSON.parse(await readFile(fichier(racine, x), 'utf8'));
    return brut && typeof brut === 'object' ? brut : {};
  } catch {
    return {};
  }
}

/** Les questions d'une exécution, toutes sorties confondues. */
export const questionsDe = (x) => (x.sorties ?? []).flatMap((s) => (Array.isArray(s.questions) ? s.questions : []));

export async function repondre(racine, x, { question, choix, note }, maintenant = new Date()) {
  if (!questionsDe(x).some((q) => q.id === question)) throw new Error('question inconnue');
  if (!CHOIX.includes(choix)) throw new Error('choix inconnu');
  const propre = String(note ?? '').replace(/\r/g, '').trim();
  if (propre.length > 1000) throw new Error('note trop longue (1000 caractères au plus)');
  const reponses = await lireReponses(racine, x);
  reponses[question] = { choix, note: propre, date: maintenant.toISOString().slice(0, 16) };
  await mkdir(path.dirname(fichier(racine, x)), { recursive: true });
  await writeFile(fichier(racine, x), `${JSON.stringify(reponses, null, 1)}\n`, 'utf8');
  return reponses;
}
