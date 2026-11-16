import assert from 'node:assert/strict';
import test from 'node:test';
import { lireStockage, occupation } from '../ihm/lib/stockage.mjs';

test("l'occupation se déduit des compteurs du système de fichiers", () => {
  const o = occupation({ bsize: 4096, blocks: 1000, bavail: 250 });
  assert.equal(o.total, 4_096_000);
  assert.equal(o.libre, 1_024_000);
  assert.equal(o.pris, 3_072_000);
  assert.equal(o.ratio, 0.75);
  assert.equal(occupation({ bsize: 4096, blocks: 0, bavail: 0 }).ratio, null);
});

test('le disque du dépôt répond, et pris + libre font le total', async () => {
  const s = await lireStockage(process.cwd());
  assert.ok(s.total > 0 && s.disque);
  assert.equal(s.pris + s.libre, s.total);
});
