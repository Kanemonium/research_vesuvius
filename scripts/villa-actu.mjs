// Relève ce qui est public sur GitHub pour le tiroir de l'IHM : les règles de contribution de
// ScrollPrize/villa, ses issues et demandes de fusion récentes, et celles qui nous mentionnent.
//
//   node --env-file=.env scripts/villa-actu.mjs [compte GitHub à chercher dans les mentions]
//
// Écrit local/discord/github-brut.json (ignoré par git). Agent C. le traduit ensuite dans
// local/discord/lecture.json. Le jeton ne sert qu'à lire ; il n'est écrit nulle part.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEPOT = 'ScrollPrize/villa';
const jeton = process.env.GITHUB_TOKEN;
if (!jeton) throw new Error('GITHUB_TOKEN absent : lancer avec --env-file=.env');

async function appel(chemin, brut = false) {
  const r = await fetch(`https://api.github.com${chemin}`, {
    headers: {
      Authorization: `Bearer ${jeton}`,
      Accept: brut ? 'application/vnd.github.raw+json' : 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'research-cockpit',
    },
  });
  if (!r.ok) return null;
  return brut ? r.text() : r.json();
}
const court = (t, n = 1500) => (t ?? '').replace(/\r/g, '').slice(0, n);
const fiche = (i) => ({
  numero: i.number, genre: i.pull_request ? 'pr' : 'issue', titre: i.title, auteur: i.user?.login, avatar: i.user?.avatar_url,
  etat: i.pull_request?.merged_at ? 'fusionnée' : i.state, brouillon: i.draft ?? false, creee: i.created_at, maj: i.updated_at,
  commentaires: i.comments, etiquettes: (i.labels ?? []).map((l) => l.name), lien: i.html_url, corps: court(i.body),
});

const regles = {};
for (const f of ['CONTRIBUTING.md', '.github/CONTRIBUTING.md', 'docs/CONTRIBUTING.md', '.github/PULL_REQUEST_TEMPLATE.md', '.github/pull_request_template.md', 'AGENTS.md', 'CLAUDE.md']) {
  const texte = await appel(`/repos/${DEPOT}/contents/${f}`, true);
  if (texte) regles[f] = texte;
}
const tete = await appel(`/repos/${DEPOT}/commits?per_page=1`);
const recents = await appel(`/repos/${DEPOT}/issues?state=all&sort=updated&direction=desc&per_page=60`);
const compte = process.argv[2];
const pourMoi = compte ? await appel(`/search/issues?q=${encodeURIComponent(`repo:${DEPOT} involves:${compte}`)}&per_page=30`) : null;

const sortie = path.join(RACINE, 'local', 'discord');
await mkdir(sortie, { recursive: true });
await writeFile(path.join(sortie, 'github-brut.json'), JSON.stringify({
  releve_le: new Date().toISOString(), depot: DEPOT, commit: tete?.[0]?.sha ?? null,
  regles, recents: (recents ?? []).map(fiche), pour_moi: (pourMoi?.items ?? []).map(fiche),
}, null, 1));
console.log(`règles : ${Object.keys(regles).join(', ') || 'aucun fichier trouvé'}`);
console.log(`récents : ${(recents ?? []).length} ; pour ${compte ?? '—'} : ${pourMoi?.items?.length ?? 0} ; commit ${tete?.[0]?.sha?.slice(0, 7)}`);
