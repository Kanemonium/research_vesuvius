// Mouvement du dépôt : état git local, et activité GitHub quand un jeton est fourni.
// Le jeton reste ici, côté serveur : il n'est jamais envoyé au navigateur.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const API = 'https://api.github.com';
const DUREE_CACHE_MS = 60_000;
let cache = { quand: 0, valeur: null };

async function git(racine, ...args) {
  try {
    const { stdout } = await exec('git', args, { cwd: racine, windowsHide: true });
    return stdout.trim();
  } catch {
    return null;
  }
}

export async function etatLocal(racine) {
  const branche = await git(racine, 'rev-parse', '--abbrev-ref', 'HEAD');
  if (branche === null && (await git(racine, 'rev-parse', '--git-dir')) === null) return { depot: false };
  const journal = await git(racine, 'log', '-12', '--pretty=format:%h%x1f%s%x1f%an%x1f%cI');
  const statut = (await git(racine, 'status', '--porcelain')) ?? '';
  return {
    depot: true,
    branche: (await git(racine, 'symbolic-ref', '--short', 'HEAD')) ?? branche,
    distant: await git(racine, 'remote', 'get-url', 'origin'),
    modifies: statut ? statut.split('\n').length : 0,
    commits: journal ? journal.split('\n').map((l) => {
      const [sha, message, auteur, date] = l.split('\x1f');
      return { sha, message, auteur, date };
    }) : [],
  };
}

/** « proprietaire/nom » à partir de GITHUB_REPO ou de l'adresse du dépôt distant. */
export function nomDepot(env, distant) {
  if (env.GITHUB_REPO) return env.GITHUB_REPO.trim();
  const m = /github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/.exec(distant ?? '');
  return m ? m[1] : null;
}

async function appel(jeton, chemin) {
  const r = await fetch(API + chemin, {
    headers: {
      Authorization: `Bearer ${jeton}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'research-cockpit',
    },
  });
  if (!r.ok) return { erreur: r.status };
  return r.json();
}
const liste = (x) => (Array.isArray(x) ? x : []);

export async function etatGithub(racine, env = process.env) {
  const local = await etatLocal(racine);
  const jeton = env.GITHUB_TOKEN;
  if (!jeton) return { local, connecte: false, raison: 'Aucun jeton GitHub dans .env.' };
  if (cache.valeur && Date.now() - cache.quand < DUREE_CACHE_MS) return { ...cache.valeur, local };

  const moi = await appel(jeton, '/user');
  if (moi.erreur) return { local, connecte: false, raison: `GitHub a refusé le jeton (code ${moi.erreur}).` };
  const compte = { login: moi.login, url: moi.html_url, depotsPublics: moi.public_repos };
  const depot = nomDepot(env, local.distant);
  let valeur = { connecte: true, compte, depot: null };

  if (depot) {
    const [infos, commits, prs, issues, runs] = await Promise.all([
      appel(jeton, `/repos/${depot}`),
      appel(jeton, `/repos/${depot}/commits?per_page=12`),
      appel(jeton, `/repos/${depot}/pulls?state=all&per_page=10`),
      appel(jeton, `/repos/${depot}/issues?state=all&per_page=15`),
      appel(jeton, `/repos/${depot}/actions/runs?per_page=8`),
    ]);
    valeur.depot = infos.erreur ? { nom: depot, erreur: infos.erreur } : {
      nom: infos.full_name, url: infos.html_url, prive: infos.private, etoiles: infos.stargazers_count,
      brancheParDefaut: infos.default_branch, pousse: infos.pushed_at,
      commits: liste(commits).map((c) => ({
        sha: c.sha.slice(0, 7), message: c.commit.message.split('\n')[0], auteur: c.commit.author?.name,
        date: c.commit.author?.date, url: c.html_url,
      })),
      prs: liste(prs).map((p) => ({ numero: p.number, titre: p.title, etat: p.merged_at ? 'fusionnée' : p.state === 'open' ? 'ouverte' : 'fermée', date: p.updated_at, url: p.html_url })),
      issues: liste(issues).filter((i) => !i.pull_request).map((i) => ({ numero: i.number, titre: i.title, etat: i.state === 'open' ? 'ouverte' : 'fermée', date: i.updated_at, url: i.html_url })),
      runs: liste(runs.workflow_runs).map((r) => ({ nom: r.name, branche: r.head_branch, etat: r.status, conclusion: r.conclusion, date: r.updated_at, url: r.html_url })),
    };
  }
  cache = { quand: Date.now(), valeur };
  return { ...valeur, local };
}
