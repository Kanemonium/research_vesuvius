import assert from 'node:assert/strict';
import test from 'node:test';
import { decouperJournal, duree } from '../ihm/lib/carnet.mjs';

test('la durée passe minuit', () => {
  assert.equal(duree('12:59:50', '13:07:33'), 463);
  assert.equal(duree('23:59:50', '00:00:10'), 20);
  assert.equal(duree('12:00:00', null), null);
});

test('un journal de prédiction se découpe en bandes', () => {
  const cellules = decouperJournal([
    'Zone : lignes 0 à 4096. 2 bande(s) de 2048 lignes.',
    '[12:59:50] bande 1/2 (lignes 0 à 2048) : début',
    'Using 3D convolutions',
    '[13:07:33] bande 1/2 : terminée',
    '[13:07:33] bande 2/2 (lignes 2048 à 4096) : début',
    'Using 3D convolutions',
  ].join('\n'));
  assert.deepEqual(cellules.map((c) => [c.genre, c.titre, c.etat]), [
    ['preparation', 'Préparation', null], ['bande', 'Bande 1/2', 'faite'], ['bande', 'Bande 2/2', 'en-cours'],
  ]);
  assert.equal(cellules[1].duree, 463);
  assert.equal(cellules[1].detail, 'lignes 0 à 2048');
  assert.deepEqual(cellules[1].tete, ['Using 3D convolutions']);
});

test('arrêt, reprise et bandes sautées', () => {
  const cellules = decouperJournal([
    '[12:46:03] ===== étape 2/4 : la même zone en deux bandes =====',
    '[12:47:31] bande 2/2 (lignes 16256 à 16512) : début',
    'INFO Selected 165 patches',
    '===== arrêt demandé le 2026-11-15T12:48:35+01:00 =====',
    '===== reprise nº 1 le 2026-11-15T12:48:46+01:00 =====',
    '[12:48:47] bande 1/2 (lignes 16000 à 16256) : déjà faite, sautée',
    '[12:48:47] bande 2/2 (lignes 16256 à 16512) : début',
    '[12:50:06] bande 2/2 : terminée',
    'image assemblée : 512 × 2048 pixels',
    '[12:51:01] ===== fin de l\'essai =====',
  ].join('\n'));
  assert.deepEqual(cellules.map((c) => [c.genre, c.etat]), [
    ['etape', null], ['bande', 'interrompue'], ['evenement', null], ['evenement', null],
    ['bande', 'sautee'], ['bande', 'faite'], ['suite', null], ['evenement', null],
  ]);
  assert.equal(cellules[0].detail, 'la même zone en deux bandes');
  assert.equal(cellules[6].tete[0], 'image assemblée : 512 × 2048 pixels');
});

test('un entraînement se coupe à sa première barre, et une longue cellule est abrégée', () => {
  const barres = Array.from({ length: 400 }, (_, i) => `  ${i}%|█         | ${i}/20000 [00:40<1:50:49,  2.99it/s, loss=0.5, lr=1e-03]`);
  const cellules = decouperJournal(['Using 3D convolutions', ...barres].join('\n'));
  assert.deepEqual(cellules.map((c) => c.genre), ['preparation', 'iterations']);
  assert.equal(cellules[1].total, 400);
  assert.ok(cellules[1].masquees > 200);
  assert.equal(cellules[1].tete.length, 12);
  assert.match(cellules[1].queue.at(-1), /399\/20000/);
});

test('une barre réécrite par retour chariot ne laisse que son dernier état', () => {
  const [c] = decouperJournal('a\rb\rc\n');
  assert.deepEqual(c.tete, ['c']);
});
