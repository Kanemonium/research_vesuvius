// Occupation du disque qui porte le dépôt (et, sur cette machine, le disque virtuel de WSL).
import { statfs } from 'node:fs/promises';
import path from 'node:path';

/** Ramène les compteurs du système de fichiers à des octets : pris, libre, total, et la part occupée. */
export function occupation({ bsize, blocks, bavail }) {
  const total = bsize * blocks;
  const libre = bsize * bavail;
  const pris = total - libre;
  return { total, libre, pris, ratio: total ? pris / total : null };
}

export async function lireStockage(racine) {
  return { disque: path.parse(path.resolve(racine)).root.replace(/[\\/]+$/, '') || '/', ...occupation(await statfs(racine)) };
}
