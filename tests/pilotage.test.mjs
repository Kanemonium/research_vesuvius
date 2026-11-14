import assert from 'node:assert/strict';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { nomDepot } from '../ihm/lib/github.mjs';
import {
  changerStatutTache, chargerEtat, deposerMessage, lireBoite, lireEntete, lireSections,
} from '../ihm/lib/pilotage.mjs';

const depot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let copie;

before(async () => {
  copie = await mkdtemp(path.join(tmpdir(), 'pilotage-'));
  await cp(path.join(depot, 'pilotage'), path.join(copie, 'pilotage'), { recursive: true });
});
after(() => rm(copie, { recursive: true, force: true }));

test("l'en-tête et les sections d'une piste sont lus", () => {
  const { meta, corps } = lireEntete('---\nid: P-1\ntitre: "Essai : test"\n---\n\n## Constat\n\nUn **fait**.\n\n## Suite\n\nRien.\n');
  assert.equal(meta.id, 'P-1');
  assert.equal(meta.titre, 'Essai : test');
  const sections = lireSections(corps);
  assert.deepEqual(sections.map((s) => s.titre), ['Constat', 'Suite']);
  assert.match(sections[0].html, /<strong>fait<\/strong>/);
});

test('un fichier sans en-tête est refusé', () => {
  assert.throws(() => lireEntete('## Constat\n'), /en-tête/);
});

test('le carnet du dépôt est cohérent', async () => {
  const etat = await chargerEtat(depot);
  assert.deepEqual(etat.erreurs, []);
  assert.equal(etat.pistes.filter((p) => p.type === 'racine').length, 1);
});

test('un parent introuvable et une piste de tâche inconnue sont signalés', async () => {
  const piste = path.join(copie, 'pilotage', 'pistes', 'P-999-orpheline.md');
  const tache = path.join(copie, 'pilotage', 'taches', 'T-999-perdue.md');
  await writeFile(piste, '---\nid: P-999\ntitre: Orpheline\ntype: piste\ndomaine: encre\nstatut: a-explorer\nparent: P-404\n---\n');
  await writeFile(tache, '---\nid: T-999\ntitre: Perdue\nstatut: a-faire\npiste: P-404\n---\n');
  const { erreurs } = await chargerEtat(copie);
  assert.ok(erreurs.some((e) => e.includes('P-999') && e.includes('P-404')));
  assert.ok(erreurs.some((e) => e.includes('T-999') && e.includes('P-404')));
  await rm(piste);
  await rm(tache);
});

test("changer le statut d'une tâche ne modifie que cette ligne", async () => {
  const avant = (await chargerEtat(copie)).taches.find((t) => t.id === 'T-001');
  const fichier = path.join(copie, avant.fichier);
  const texteAvant = await readFile(fichier, 'utf8');
  await changerStatutTache(copie, 'T-001', 'faite');
  const texteApres = await readFile(fichier, 'utf8');
  assert.equal(texteApres, texteAvant.replace(`statut: ${avant.statut}`, 'statut: faite'));
  await assert.rejects(changerStatutTache(copie, 'T-001', 'nimporte'), /statut inconnu/);
  await assert.rejects(changerStatutTache(copie, '../x', 'faite'), /invalide/);
});

test('un message déposé se retrouve dans la boîte, sous « À lire »', async () => {
  await deposerMessage(copie, 'Regarder P-320\navant jeudi', new Date('2026-11-14T10:30:00Z'));
  const messages = await lireBoite(copie);
  assert.equal(messages.length, 1);
  assert.match(messages[0], /2026-11-14 10:30/);
  assert.match(messages[0], /Regarder P-320/);
  const contenu = await readFile(path.join(copie, 'pilotage', 'boite.md'), 'utf8');
  assert.ok(contenu.indexOf('Regarder') < contenu.indexOf('## Traités'));
  await assert.rejects(deposerMessage(copie, '   '), /vide/);
});

test("le nom du dépôt se déduit de l'adresse distante", () => {
  assert.equal(nomDepot({}, 'https://github.com/qui/quoi.git'), 'qui/quoi');
  assert.equal(nomDepot({}, 'git@github.com:qui/quoi.git'), 'qui/quoi');
  assert.equal(nomDepot({ GITHUB_REPO: 'a/b' }, null), 'a/b');
  assert.equal(nomDepot({}, null), null);
});
