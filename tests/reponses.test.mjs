import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { lireReponses, repondre } from '../ihm/lib/reponses.mjs';

const execution = { id: 'X-900', dossier: 'experiments/essai', sorties: [{ genre: 'image', questions: [{ id: 'Q1', assertion: 'a' }, { id: 'Q2', assertion: 'b' }] }] };

test('une réponse est enregistrée, puis remplacée par la suivante', async () => {
  const racine = await mkdtemp(path.join(os.tmpdir(), 'reponses-'));
  assert.deepEqual(await lireReponses(racine, execution), {});
  await repondre(racine, execution, { question: 'Q1', choix: 'confirme', note: ' oui ' }, new Date('2026-11-16T18:00:00Z'));
  await repondre(racine, execution, { question: 'Q2', choix: 'ne-sait-pas' });
  await repondre(racine, execution, { question: 'Q1', choix: 'infirme', note: '' });
  const r = await lireReponses(racine, execution);
  assert.equal(r.Q1.choix, 'infirme');
  assert.equal(r.Q2.choix, 'ne-sait-pas');
  assert.deepEqual(Object.keys(r).sort(), ['Q1', 'Q2']);
});

test('une question ou un choix inconnus sont refusés', async () => {
  const racine = await mkdtemp(path.join(os.tmpdir(), 'reponses-'));
  await assert.rejects(repondre(racine, execution, { question: 'Q9', choix: 'confirme' }), /question inconnue/);
  await assert.rejects(repondre(racine, execution, { question: 'Q1', choix: 'peut-être' }), /choix inconnu/);
  assert.deepEqual(await lireReponses(racine, execution), {});
});
