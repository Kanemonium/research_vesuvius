import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { lireDiscord } from '../ihm/lib/discord.mjs';

async function racineAvec(lecture) {
  const racine = await mkdtemp(path.join(os.tmpdir(), 'discord-'));
  if (lecture) {
    await mkdir(path.join(racine, 'local', 'discord'), { recursive: true });
    await writeFile(path.join(racine, 'local', 'discord', 'lecture.json'), JSON.stringify(lecture));
  }
  return racine;
}

test('sans lecture, le tiroir est vide et demande à être lu', async () => {
  const d = await lireDiscord(await racineAvec(null));
  assert.equal(d.lu_le, null);
  assert.equal(d.a_relire, true);
  assert.deepEqual(Object.keys(d.problemes), ['encre', 'deroulement']);
});

test('l’alerte apparaît après huit heures', async () => {
  const racine = await racineAvec({ lu_le: '2026-11-15T10:00:00Z' });
  assert.equal((await lireDiscord(racine, new Date('2026-11-15T17:30:00Z'))).a_relire, false);
  const tard = await lireDiscord(racine, new Date('2026-11-15T18:30:00Z'));
  assert.equal(tard.a_relire, true);
  assert.equal(tard.age_heures, 8.5);
});

test('nos réponses s’insèrent dans l’actualité de leur problème, à leur date', async () => {
  const racine = await racineAvec({
    lu_le: '2026-11-15T10:00:00Z',
    problemes: { encre: { actu: [{ date: '2026-11-15T09:00', auteur: 'a', texte: 'un' }, { date: '2026-11-15T11:00', auteur: 'b', texte: 'trois' }] } },
    reponses: [{ date: '2026-11-15T10:00', probleme: 'encre', texte_en: 'two', texte_fr: 'deux', statut: 'brouillon', pour_moi: true }],
  });
  const d = await lireDiscord(racine);
  assert.deepEqual(d.problemes.encre.actu.map((m) => m.texte ?? m.texte_fr), ['trois', 'deux', 'un']);
  assert.equal(d.problemes.encre.actu[1].nous, true);
  assert.equal(d.problemes.deroulement.actu.length, 0);
  assert.equal(d.pour_moi.length, 1);
});
