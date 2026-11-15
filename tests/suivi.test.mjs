import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { after, before, test } from 'node:test';
import { lireJournal, lireProgression, suiviExecution } from '../ihm/lib/suivi.mjs';

const x = { id: 'X-900', dossier: 'experiments/essai' };
let racine; let journaux;

before(async () => {
  racine = await mkdtemp(path.join(tmpdir(), 'suivi-'));
  journaux = path.join(racine, x.dossier, 'journaux');
  await mkdir(journaux, { recursive: true });
});
after(() => rm(racine, { recursive: true, force: true }));

test('la dernière barre de progression du journal est lue', () => {
  const p = lireProgression('début\r 41%|████      | 8200/20000 [46:30<1:07:00,  2.93it/s, loss=0.5]\r 42%|████▏     | 8400/20000 [47:40<1:05:50,  2.94it/s, loss=0.4783, lr=5e-3]');
  assert.deepEqual(p, { fait: 8400, total: 20000, ecoule: '47:40', restant: '1:05:50', vitesse: '2,94 it/s', perte: 0.4783 });
  assert.equal(lireProgression('aucune barre ici'), null);
  assert.equal(lireProgression('  0%|          | 0/60 [00:00<?, ?it/s]'), null);
});

test("une exécution jamais lancée n'a pas d'état", async () => {
  assert.deepEqual(await suiviExecution(racine, x), { etat: null, debut: null, fin: null, code: null, picVram: null, journal: false, taille: 0, progression: null, silence: null });
  assert.equal((await suiviExecution(racine, { id: '../x', dossier: '.' })).etat, null);
});

test("pendant l'exécution : en cours, avec sa progression et son journal", async () => {
  await writeFile(path.join(journaux, 'X-900.etat.json'), JSON.stringify({ id: 'X-900', debut: '2026-11-15T10:00:00+01:00', fin: null, code: null, pic_vram_mo: null }));
  await writeFile(path.join(journaux, 'X-900.brut.log'), 'Chargement\n 10%|#         | 6/60 [00:02<00:18,  3.00it/s, loss=0.9]\r 50%|#####     | 30/60 [00:10<00:10,  3.00it/s, loss=0.5]');
  const s = await suiviExecution(racine, x);
  assert.equal(s.etat, 'en-cours');
  assert.equal(s.progression.fait, 30);
  assert.equal(s.progression.total, 60);
  assert.equal(typeof s.silence, 'number');

  const debut = await lireJournal(racine, x, 0);
  assert.match(debut.texte, /^Chargement/);
  assert.equal(debut.brut, true);
  const suite = await lireJournal(racine, x, debut.suite);
  assert.equal(suite.texte, '');
  assert.equal(suite.suite, debut.suite);
});

test('un journal condensé accentué se relit à partir d’un décalage', async () => {
  const texte = 'é'.repeat(10);
  await writeFile(path.join(journaux, 'X-901.log'), texte);
  // « é » tient sur deux octets : à partir de l'octet 2, il en reste neuf.
  const r = await lireJournal(racine, { ...x, id: 'X-901' }, 2);
  assert.equal(r.texte, 'é'.repeat(9));
  assert.equal(r.brut, false);
});

test('à la fin : terminée si le code de sortie est nul, échouée sinon', async () => {
  const etat = { id: 'X-900', debut: '2026-11-15T10:00:00+01:00', fin: '2026-11-15T10:01:00+01:00', code: 0, pic_vram_mo: 4959 };
  await writeFile(path.join(journaux, 'X-900.etat.json'), JSON.stringify(etat));
  const fini = await suiviExecution(racine, x);
  assert.equal(fini.etat, 'terminee');
  assert.equal(fini.picVram, 4959);
  assert.equal(fini.silence, null);
  await writeFile(path.join(journaux, 'X-900.etat.json'), JSON.stringify({ ...etat, code: 137 }));
  assert.equal((await suiviExecution(racine, x)).etat, 'echouee');
});
