// Les images d'une exécution. Elles ne sont jamais dans le dépôt (aucune donnée de rouleau n'y entre) :
// ce sont des aperçus réduits, rangés dans local/apercus/ sur la machine où l'exécution a tourné, et
// servis par /apercus/<fichier>. Ailleurs, l'image manque : on le dit au lieu de laisser un cadre vide.
import { ouvrirLoupe } from './loupe.js';
import { h, lier } from './outils.js';

/** Les sorties de genre « image » d'une exécution. */
export const imagesDe = (x) => (x?.sorties ?? []).filter((s) => s.genre === 'image' && s.fichier);

/** Une image avec sa légende. « compact » : une vignette, pour les endroits qui ne font que renvoyer vers l'exécution. */
export function figureApercu(s, { compact = false } = {}) {
  const adresse = `/apercus/${encodeURIComponent(s.fichier)}`;
  const absente = h('p', { classe: 'apercu-absent', hidden: '' }, 'Image restée sur la machine où l’exécution a tourné : elle n’est pas dans le dépôt.');
  const img = h('img', { src: adresse, alt: s.alt ?? s.titre ?? '', loading: 'lazy' });
  const lien = h('a', { classe: 'apercu-cadre', href: adresse, target: '_blank', rel: 'noreferrer', title: 'Ouvrir l’image en grand' }, img);
  img.addEventListener('error', () => { lien.hidden = true; absente.hidden = false; });
  return h('figure', { classe: `apercu ${compact ? 'compact' : ''}` }, lien, absente,
    h('figcaption', {}, compact ? h('strong', {}, s.titre) : null, s.legende ? lier(h('span', {}, s.legende)) : null,
      // Une image découpée en tuiles peut se parcourir de près.
      s.tuiles && !compact ? h('button', { classe: 'bouton mini lp-ouvrir', type: 'button', onclick: () => ouvrirLoupe(s.tuiles, `${s.tuiles} à la loupe`) }, 'Parcourir à la loupe') : null));
}

/** Les vignettes de toutes les images de plusieurs exécutions, ou null s'il n'y en a aucune. */
export function vignettes(executions, max = 3) {
  const images = executions.flatMap((x) => imagesDe(x).slice(0, max));
  return images.length ? h('div', { classe: 'apercus' }, images.map((s) => figureApercu(s, { compact: true }))) : null;
}
