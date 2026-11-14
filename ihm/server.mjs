// Serveur local de l'IHM. N'écoute que sur 127.0.0.1.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { etatGithub } from './lib/github.mjs';
import { changerStatutTache, chargerEtat, deposerMessage, empreinte, lireBoite } from './lib/pilotage.mjs';

const ICI = path.dirname(fileURLToPath(import.meta.url));
const RACINE = path.resolve(ICI, '..');
const PUBLIC = path.join(ICI, 'public');
const CONCEPTS = path.join(RACINE, 'docs', 'concepts');
const PORT = Number(process.env.IHM_PORT || process.env.PORT) || 4173;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json',
};

function json(res, code, corps) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(corps));
}

async function corpsJson(req) {
  let brut = '';
  for await (const morceau of req) {
    brut += morceau;
    if (brut.length > 20_000) throw new Error('requête trop volumineuse');
  }
  return JSON.parse(brut || '{}');
}

// Les écritures ne sont acceptées que depuis la page servie ici (pas depuis un autre site ouvert dans le navigateur).
function origineLocale(req) {
  const origine = req.headers.origin;
  return !origine || origine === `http://127.0.0.1:${PORT}` || origine === `http://localhost:${PORT}`;
}

async function api(req, res, url) {
  if (req.method !== 'GET' && !origineLocale(req)) return json(res, 403, { erreur: 'origine refusée' });

  if (req.method === 'GET' && url.pathname === '/api/etat') {
    const etat = await chargerEtat(RACINE);
    return json(res, 200, { ...etat, boite: await lireBoite(RACINE) });
  }
  if (req.method === 'GET' && url.pathname === '/api/version') {
    return json(res, 200, { version: await empreinte(RACINE) });
  }
  if (req.method === 'GET' && url.pathname === '/api/github') {
    return json(res, 200, await etatGithub(RACINE));
  }
  const tache = /^\/api\/taches\/(T-\d+)$/.exec(url.pathname);
  if (req.method === 'PATCH' && tache) {
    const { statut } = await corpsJson(req);
    await changerStatutTache(RACINE, tache[1], statut);
    return json(res, 200, { ok: true });
  }
  if (req.method === 'POST' && url.pathname === '/api/boite') {
    const { texte } = await corpsJson(req);
    await deposerMessage(RACINE, texte);
    return json(res, 200, { ok: true });
  }
  return json(res, 404, { erreur: 'route inconnue' });
}

async function statique(res, url) {
  // Les planches des fiches vivent avec les fiches, dans docs/concepts/img/.
  const planche = /^\/concepts\/img\/([\w.-]+\.svg)$/.exec(url.pathname);
  const base = planche ? path.join(CONCEPTS, 'img') : PUBLIC;
  const relatif = planche ? planche[1] : url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname).replace(/^\/+/, '');
  const fichier = path.resolve(base, relatif);
  if (fichier !== base && !fichier.startsWith(base + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  try {
    const contenu = await readFile(fichier);
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(fichier)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(contenu);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Introuvable');
  }
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  try {
    if (url.pathname.startsWith('/api/')) await api(req, res, url);
    else await statique(res, url);
  } catch (e) {
    json(res, 400, { erreur: e.message });
  }
}).listen(PORT, '127.0.0.1', () => {
  console.log(`Agent C. — IHM sur http://127.0.0.1:${PORT}`);
});
