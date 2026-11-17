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
  // La copie part de la vraie boîte, qui peut déjà contenir des messages à lire.
  const deposes = messages.filter((m) => /Regarder P-320/.test(m));
  assert.equal(deposes.length, 1);
  assert.match(deposes[0], /2026-11-14 10:30/);
  const contenu = await readFile(path.join(copie, 'pilotage', 'boite.md'), 'utf8');
  assert.ok(contenu.indexOf('Regarder') < contenu.indexOf('## Traités'));
  await assert.rejects(deposerMessage(copie, '   '), /vide/);
});

test('chaque fiche existe en français et en anglais, avec sa planche', async () => {
  const { fiches, erreurs } = await chargerEtat(depot);
  assert.deepEqual(erreurs, []);
  assert.ok(fiches.length >= 10);
  for (const f of fiches) {
    assert.equal(f.fr.sections.length >= 3 && f.en.sections.length >= 3, true, f.id);
    assert.equal(f.fr.sections.filter((s) => s.titre !== 'Le vocabulaire anglais').length, f.en.sections.length, f.id);
    assert.match(f.image, /^img\/K-\d+.*\.svg$/);
  }
});

test("le nom du dépôt se déduit de l'adresse distante", () => {
  assert.equal(nomDepot({}, 'https://github.com/qui/quoi.git'), 'qui/quoi');
  assert.equal(nomDepot({}, 'git@github.com:qui/quoi.git'), 'qui/quoi');
  assert.equal(nomDepot({ GITHUB_REPO: 'a/b' }, null), 'a/b');
  assert.equal(nomDepot({}, null), null);
});

test("le parcours d'une tâche n'accepte que des étapes et des bugs aux états connus", async () => {
  const tache = path.join(copie, 'pilotage', 'taches', 'T-998-parcours.md');
  await writeFile(tache, [
    '---', 'id: T-998', 'titre: Parcours', 'statut: a-faire', 'piste: P-000', 'etapes:',
    '  - genre: bug', '    statut: faite', '    titre: Mal rangé',
    '  - genre: etape', '    statut: faite', '    titre: Bien rangé', '---', '',
  ].join('\n'));
  const { erreurs, taches } = await chargerEtat(copie);
  assert.equal(taches.find((t) => t.id === 'T-998').etapes.length, 2);
  assert.equal(erreurs.filter((e) => e.includes('T-998')).length, 1);
  assert.ok(erreurs.some((e) => e.includes('T-998, étape 1') && e.includes('faite')));
  await rm(tache);
});

test('chaque exécution montre du code réel, des notes sur des lignes existantes et des fiches connues', async () => {
  const { executions, fiches, erreurs } = await chargerEtat(depot);
  assert.deepEqual(erreurs, []);
  assert.ok(executions.length >= 2);
  const ids = new Set(fiches.map((f) => f.id));
  for (const x of executions) {
    assert.match(x.id, /^X-\d{3}$/);
    assert.ok(x.bilan.length >= 1 && x.code.length >= 1, x.id);
    // Une exécution prévue n'a encore rien mesuré : pas de sorties. Une exécution terminée en a.
    assert.equal(x.sorties.length >= 1, x.statut === 'terminee', `${x.id} : sorties et statut « ${x.statut} »`);
    for (const c of x.code) {
      assert.ok(c.lignes.length > 0 && c.notes.length > 0, `${x.id} : ${c.titre}`);
      for (const n of c.notes) for (const k of n.fiches) assert.ok(ids.has(k), `${x.id} : ${k}`);
    }
  }
});
