// Le carnet d'une exécution : son journal découpé en cellules, à la manière d'un notebook.
// Nos exécutions ne tournent pas dans un notebook mais par des scripts ; c'est le journal qui porte
// les repères (« étape k/n », « bande i/n », « reprise nº … ») écrits par scripts/wsl/. Lecture seule.
import { open, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const HEURE = String.raw`\[(\d\d:\d\d:\d\d)\]`;
const ETAPE = new RegExp(`^${HEURE} ===== étape (\\d+)/(\\d+) : (.*?) =====$`);
const FIN = new RegExp(`^${HEURE} ===== (fin.*?) =====$`);
const BANDE_DEBUT = new RegExp(`^${HEURE} bande (\\d+)/(\\d+) \\(lignes (\\d+) à (\\d+)\\) : début$`);
const BANDE_FIN = new RegExp(`^${HEURE} bande (\\d+)/(\\d+) : terminée$`);
const BANDE_SAUTEE = new RegExp(`^${HEURE} bande (\\d+)/(\\d+) \\(lignes (\\d+) à (\\d+)\\) : déjà faite, sautée$`);
const EVENEMENT = /^===== (arrêt demandé|reprise nº \d+) le (\S+) =====$/;
const BARRE = /\d+%\|[^|]*\|\s*\d+\/\d+\s*\[/;
/** Lignes gardées par cellule : le début pour le contexte, la fin pour l'état courant. */
const TETE = 12;
const QUEUE = 60;
const LECTURE_MAX = 8 * 1024 * 1024;

const secondes = (h) => h.split(':').reduce((n, v) => n * 60 + Number(v), 0);
/** Durée entre deux heures « HH:MM:SS » du même journal ; un passage de minuit est compté. */
export function duree(debut, fin) {
  if (!debut || !fin) return null;
  return (secondes(fin) - secondes(debut) + 86400) % 86400;
}

/** Découpe le texte d'un journal en cellules. Fonction pure : c'est elle que les tests exercent. */
export function decouperJournal(texte) {
  const cellules = [];
  let courante = null;
  const ouvrir = (c) => { courante = { detail: null, debut: null, fin: null, etat: null, total: 0, lignes: [], ...c }; cellules.push(courante); return courante; };
  const ecrire = (ligne) => {
    if (!courante || courante.close) ouvrir({ genre: cellules.length ? 'suite' : 'preparation', titre: cellules.length ? 'Suite' : 'Préparation' });
    courante.total += 1;
    courante.lignes.push(ligne);
    // On ne garde que le début et la fin : une cellule d'entraînement compte des milliers de lignes.
    if (courante.lignes.length > TETE + QUEUE * 2) courante.lignes.splice(TETE, courante.lignes.length - TETE - QUEUE);
  };

  for (const brute of String(texte).replace(/\r\n/g, '\n').split('\n')) {
    // Une barre de progression se réécrit sur place avec des retours chariot : seul son dernier état compte.
    const ligne = brute.split('\r').filter(Boolean).pop() ?? '';
    let m;
    if ((m = ETAPE.exec(ligne))) {
      ouvrir({ genre: 'etape', titre: `Étape ${m[2]}/${m[3]}`, detail: m[4], debut: m[1], numero: Number(m[2]), sur: Number(m[3]) });
    } else if ((m = BANDE_DEBUT.exec(ligne))) {
      ouvrir({ genre: 'bande', titre: `Bande ${m[2]}/${m[3]}`, detail: `lignes ${m[4]} à ${m[5]}`, debut: m[1], etat: 'en-cours', numero: Number(m[2]), sur: Number(m[3]) });
    } else if ((m = BANDE_FIN.exec(ligne))) {
      if (courante?.genre === 'bande' && courante.etat === 'en-cours') Object.assign(courante, { fin: m[1], etat: 'faite', close: true });
    } else if ((m = BANDE_SAUTEE.exec(ligne))) {
      ouvrir({ genre: 'bande', titre: `Bande ${m[2]}/${m[3]}`, detail: `lignes ${m[4]} à ${m[5]}`, debut: m[1], fin: m[1], etat: 'sautee', close: true, numero: Number(m[2]), sur: Number(m[3]) });
    } else if ((m = EVENEMENT.exec(ligne))) {
      if (m[1] === 'arrêt demandé' && courante?.etat === 'en-cours') courante.etat = 'interrompue';
      ouvrir({ genre: 'evenement', titre: m[1][0].toUpperCase() + m[1].slice(1), detail: m[2], close: true });
    } else if ((m = FIN.exec(ligne))) {
      ouvrir({ genre: 'evenement', titre: m[2][0].toUpperCase() + m[2].slice(1), debut: m[1], close: true });
    } else if (ligne.trim()) {
      if (BARRE.test(ligne) && courante?.genre === 'preparation') ouvrir({ genre: 'iterations', titre: 'Itérations' });
      ecrire(ligne);
    }
  }
  return cellules.map(({ close, lignes, ...c }) => ({
    ...c,
    duree: duree(c.debut, c.fin),
    // « masquees » : lignes du milieu laissées de côté, à dire au lecteur.
    masquees: c.total - lignes.length,
    tete: c.total > lignes.length ? lignes.slice(0, TETE) : lignes,
    queue: c.total > lignes.length ? lignes.slice(TETE) : [],
  }));
}

async function lireFin(chemin) {
  const { size } = await stat(chemin);
  if (size <= LECTURE_MAX) return { texte: await readFile(chemin, 'utf8'), tronque: false };
  const f = await open(chemin, 'r');
  try {
    const tampon = Buffer.alloc(LECTURE_MAX);
    await f.read(tampon, 0, LECTURE_MAX, size - LECTURE_MAX);
    return { texte: tampon.toString('utf8').replace(/^[^\n]*\n/, ''), tronque: true };
  } finally { await f.close(); }
}

/** Le carnet d'une exécution : la commande lancée et les cellules de son journal. */
export async function carnetExecution(racine, x, etat = null) {
  const base = path.join(racine, x.dossier, 'journaux', x.id);
  let marque = null;
  try { marque = JSON.parse(await readFile(`${base}.etat.json`, 'utf8')); } catch { /* pas encore lancée */ }
  let journal = null;
  for (const nom of [`${base}.brut.log`, `${base}.log`]) {
    try { journal = { ...(await lireFin(nom)), brut: nom.endsWith('.brut.log') }; break; } catch { /* suivant */ }
  }
  const cellules = journal ? decouperJournal(journal.texte) : [];
  // Une cellule restée ouverte n'est « en cours » que si l'exécution tourne encore.
  const vivante = etat === 'en-cours' || etat === 'en-pause';
  for (const c of cellules) if (c.etat === 'en-cours' && !vivante) c.etat = 'interrompue';
  const derniere = cellules.at(-1);
  if (vivante && derniere && derniere.etat === null && derniere.genre !== 'evenement') derniere.etat = 'en-cours';
  return { commande: marque?.commande ?? null, debut: marque?.debut ?? null, fin: marque?.fin ?? null, journal: Boolean(journal), brut: journal?.brut ?? false, tronque: journal?.tronque ?? false, cellules };
}
