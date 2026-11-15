// Suivi d'une exécution : où elle en est, et son journal.
// Le lanceur (scripts/wsl/lancer-execution.sh) écrit trois fichiers dans experiments/<dossier>/journaux/ :
//   X-….etat.json   début, fin, code de sortie, pic de mémoire vidéo
//   X-….brut.log    tout ce que le programme affiche, pendant qu'il tourne (jamais versionné)
//   X-….log         le même journal condensé, écrit à la fin : c'est lui qui est historisé
import { execFile } from 'node:child_process';
import { open, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ID = /^X-\d{3}$/;
// Une ligne de barre « tqdm » : 42%|████▏     | 8400/20000 [47:40<1:05:50,  2.94it/s, loss=0.4783, lr=…]
const BARRE = /(\d+)%\|[^|\n\r]*\|\s*(\d+)\/(\d+)\s*\[([\d:]+)<([\d:?]+),\s*([\d.]+)\s*(it\/s|s\/it)([^\]\n\r]*)\]/g;
const QUEUE = 8192;
const MORCEAU = 262144;

const dossierJournaux = (racine, x) => path.join(racine, x.dossier, 'journaux');

async function fichierJournal(racine, x) {
  const base = path.join(dossierJournaux(racine, x), x.id);
  for (const nom of [`${base}.brut.log`, `${base}.log`]) {
    try { return { chemin: nom, infos: await stat(nom), brut: nom.endsWith('.brut.log') }; } catch { /* suivant */ }
  }
  return null;
}

async function lireTranche(chemin, debut, longueur) {
  const f = await open(chemin, 'r');
  try {
    const tampon = Buffer.alloc(longueur);
    const { bytesRead } = await f.read(tampon, 0, longueur, debut);
    return tampon.subarray(0, bytesRead);
  } finally { await f.close(); }
}

/** Dernière barre de progression trouvée dans un texte, ou null. */
export function lireProgression(texte) {
  let derniere = null;
  for (const m of texte.matchAll(BARRE)) derniere = m;
  if (!derniere) return null;
  const [, , fait, total, ecoule, restant, vitesse, unite, suite] = derniere;
  const perte = /loss=([\d.]+)/.exec(suite)?.[1];
  return {
    fait: Number(fait), total: Number(total), ecoule, restant: restant.includes('?') ? null : restant,
    vitesse: `${vitesse.replace('.', ',')} ${unite === 'it/s' ? 'it/s' : 's/it'}`, perte: perte ? Number(perte) : null,
  };
}

/** Où en est une exécution. « etat » vaut null tant que le lanceur n'a rien écrit pour elle. */
export async function suiviExecution(racine, x, maintenant = Date.now()) {
  if (!ID.test(x.id ?? '')) return { etat: null, journal: false };
  let marque = null;
  try { marque = JSON.parse(await readFile(path.join(dossierJournaux(racine, x), `${x.id}.etat.json`), 'utf8')); } catch { /* pas encore lancée */ }
  const journal = await fichierJournal(racine, x);
  const suivi = {
    etat: !marque ? null : marque.fin ? (marque.code === 0 ? 'terminee' : 'echouee') : marque.pause ? 'en-pause' : 'en-cours',
    debut: marque?.debut ?? null, fin: marque?.fin ?? null, code: marque?.code ?? null, picVram: marque?.pic_vram_mo ?? null,
    pause: marque?.pause ?? null, reprises: marque?.reprises ?? 0, etape: null,
    journal: Boolean(journal), taille: journal?.infos.size ?? 0, progression: null, silence: null,
  };
  // Une commande en plusieurs étapes écrit « k n libellé » dans X-….etape (voir lancer-execution.sh).
  try {
    const [k, n, ...libelle] = (await readFile(path.join(dossierJournaux(racine, x), `${x.id}.etape`), 'utf8')).trim().split(/\s+/);
    if (Number(k) >= 1 && Number(n) >= Number(k)) suivi.etape = { numero: Number(k), total: Number(n), libelle: libelle.join(' ') || 'étape' };
  } catch { /* exécution d'un seul tenant */ }
  if (journal) {
    const depuis = Math.max(0, journal.infos.size - QUEUE);
    suivi.progression = lireProgression((await lireTranche(journal.chemin, depuis, QUEUE)).toString('utf8'));
    if (suivi.etat === 'en-cours') suivi.silence = Math.max(0, Math.round((maintenant - journal.infos.mtimeMs) / 1000));
  }
  return suivi;
}

/** Un morceau du journal à partir d'un décalage en octets ; « suite » est le décalage à redemander. */
export async function lireJournal(racine, x, depuis = 0) {
  const journal = await fichierJournal(racine, x);
  if (!journal) return { texte: '', suite: 0, tronque: false, brut: false };
  const taille = journal.infos.size;
  let debut = Number.isFinite(depuis) && depuis >= 0 && depuis <= taille ? depuis : 0;
  // Premier appel sur un gros journal : on ne renvoie que la fin.
  const tronque = debut === 0 && taille > MORCEAU;
  if (tronque) debut = taille - MORCEAU;
  let tampon = await lireTranche(journal.chemin, debut, Math.min(MORCEAU, taille - debut));
  // Un caractère UTF-8 peut tenir sur plusieurs octets : si le morceau s'arrête au milieu, on le garde pour la fois suivante.
  let k = tampon.length - 1;
  while (k >= 0 && k > tampon.length - 4 && (tampon[k] & 0xC0) === 0x80) k--;
  if (k >= 0 && tampon[k] >= 0xC0) {
    const attendu = tampon[k] >= 0xF0 ? 4 : tampon[k] >= 0xE0 ? 3 : 2;
    if (tampon.length - k < attendu) tampon = tampon.subarray(0, k);
  }
  return { texte: tampon.toString('utf8'), suite: debut + tampon.length, tronque, brut: journal.brut };
}

const ACTIONS = ['pause', 'reprendre'];
const SCRIPT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'scripts', 'wsl', 'signaler-execution.sh');
/** Chemin d'un fichier Windows vu depuis Ubuntu : C:\\a\\b devient /mnt/c/a/b. */
export const cheminWsl = (p) => p.replace(/^([A-Za-z]):[\\/]/, (_, lettre) => `/mnt/${lettre.toLowerCase()}/`).replace(/\\/g, '/');

/** Gèle ou relance le programme d'une exécution. Sous Windows, l'ordre passe par Ubuntu, là où il tourne. */
export function signalerExecution(racine, x, action, env = process.env) {
  if (!ID.test(x.id ?? '')) return Promise.reject(new Error('identifiant invalide'));
  if (!ACTIONS.includes(action)) return Promise.reject(new Error('action inconnue'));
  const dossier = path.join(racine, x.dossier);
  const [commande, args] = process.platform === 'win32'
    ? ['wsl.exe', ['-d', env.IHM_WSL_DISTRO || 'Ubuntu-24.04', '--', 'bash', cheminWsl(SCRIPT), x.id, cheminWsl(dossier), action]]
    : ['bash', [SCRIPT, x.id, dossier, action]];
  return new Promise((resolve, reject) => {
    execFile(commande, args, { timeout: 20_000, env: { ...env, WSL_UTF8: '1' } }, (erreur, sortie, plainte) => {
      if (erreur) reject(new Error((plainte || sortie || erreur.message).replace(/\0/g, '').trim() || 'ordre refusé'));
      else resolve(sortie.replace(/\0/g, '').trim());
    });
  });
}
