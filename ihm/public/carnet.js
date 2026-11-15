// Le carnet d'une exécution : une copie à lire, présentée comme un notebook.
// En haut, le code utile avec ses annotations (les mêmes que sur la page) ; en dessous, ce que
// l'exécution a affiché, découpé en cellules par le serveur (/api/executions/X-…/carnet) et
// rafraîchi toutes les trois secondes tant qu'elle tourne. Rien ne s'y lance : c'est de la lecture.
import { figureApercu, imagesDe } from './apercu.js';
import { dateLongue, h, pilule } from './outils.js';

const ICONE = '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4.500" y="2.800" width="11.500" height="14.400" rx="1.600"/><path d="M7.500 2.800v14.400M3 6.500h3M3 10h3M3 13.500h3M10 7h3.500M10 10h3.500"/></svg>';
const ETATS = {
  faite: { nom: 'terminée', statut: 'faite' }, 'en-cours': { nom: 'en cours', statut: 'en-cours' },
  sautee: { nom: 'déjà faite, sautée', statut: 'a-faire' }, interrompue: { nom: 'interrompue', statut: 'bloquee' },
};

function duree(s) {
  if (s === null || s === undefined) return null;
  const hh = Math.floor(s / 3600); const mm = Math.floor((s % 3600) / 60); const ss = s % 60;
  return hh ? `${hh} h ${String(mm).padStart(2, '0')} min` : mm ? `${mm} min ${String(ss).padStart(2, '0')} s` : `${ss} s`;
}

/** Bouton rond « ouvrir le carnet », à poser à droite du titre de l'exécution. */
export function boutonCarnet(x, codeAnnote) {
  return h('button', { classe: 'bouton-rond carnet-bouton', type: 'button', title: 'Ouvrir le carnet de cette exécution', 'aria-label': `Ouvrir le carnet de ${x.id}`, html: ICONE, onclick: () => ouvrirCarnet(x, codeAnnote) });
}

function sortie(c, n) {
  const e = ETATS[c.etat];
  const lignes = [...c.tete, ...(c.masquees ? [`⋯ ${c.masquees.toLocaleString('fr-FR')} lignes non montrées ⋯`] : []), ...c.queue];
  if (c.genre === 'evenement') {
    return h('div', { classe: 'cn-evenement' }, h('span', { classe: 'etiquette' }, c.titre), h('span', { classe: 'meta' }, c.detail ? dateLongue(c.detail) : c.debut ?? ''));
  }
  return h('section', { classe: 'cn-cellule', 'data-genre': c.genre, 'data-etat': c.etat ?? 'neutre' },
    h('div', { classe: 'cn-marge' }, h('span', { classe: 'cn-compteur' }, `Out [${n}]`)),
    h('div', { classe: 'cn-corps' },
      h('header', { classe: 'cn-tete' },
        h('strong', {}, c.titre), c.detail ? h('span', { classe: 'doux' }, c.detail) : null,
        e ? h('span', { classe: 'pilule', 'data-statut': e.statut }, e.nom) : null,
        h('span', { classe: 'meta cn-temps' }, [c.debut, c.duree !== null && c.etat === 'faite' ? duree(c.duree) : null].filter(Boolean).join(' · '))),
      lignes.length ? h('pre', { classe: 'journal cn-sortie', tabindex: 0 }, lignes.join('\n'))
        : h('p', { classe: 'meta cn-muet' }, c.etat === 'en-cours' ? 'Rien d’affiché pour l’instant.' : 'Aucune sortie.')));
}

export function ouvrirCarnet(x, codeAnnote) {
  const sorties = h('div', { classe: 'cn-sorties' }, h('p', { classe: 'doux' }, 'Lecture du journal…'));
  const etat = h('span', { classe: 'cn-etat' });
  const fenetre = h('dialog', { classe: 'journal-fenetre carnet-fenetre', 'aria-label': `Carnet de ${x.id}` },
    h('header', { classe: 'cn-entete' },
      h('span', { classe: 'etiquette' }, x.id), h('h2', { classe: 'cn-titre' }, x.titre), etat,
      h('span', { classe: 'pilule', title: 'Ce carnet ne lance rien : il montre le code et ce que l’exécution a affiché.' }, 'lecture seule'),
      h('button', { classe: 'dsc-fermer', type: 'button', 'aria-label': 'Fermer le carnet', onclick: () => fenetre.close() }, '×')),
    h('div', { classe: 'cn-page' },
      h('p', { classe: 'cn-note' }, 'Nos exécutions ne tournent pas dans un notebook : elles sont lancées par des scripts. Cette page en est une copie à lire, découpée de la même façon. D’abord le code utile et ses annotations, puis ce que le programme a affiché, étape par étape.'),
      h('h3', { classe: 'cn-partie' }, 'Le code'),
      x.code.length ? x.code.map((bloc, i) => h('section', { classe: 'cn-cellule', 'data-genre': 'code' },
        h('div', { classe: 'cn-marge' }, h('span', { classe: 'cn-compteur' }, `In [${i + 1}]`)),
        h('div', { classe: 'cn-corps' }, codeAnnote(bloc)))) : h('p', { classe: 'doux' }, 'Aucun extrait de code n’est consigné pour cette exécution.'),
      h('h3', { classe: 'cn-partie' }, 'L’exécution'),
      sorties,
      // Comme la dernière cellule d'un notebook : les images que l'exécution a produites.
      imagesDe(x).length ? [h('h3', { classe: 'cn-partie' }, 'Les images'),
        imagesDe(x).map((s, i) => h('section', { classe: 'cn-cellule', 'data-genre': 'image' },
          h('div', { classe: 'cn-marge' }, h('span', { classe: 'cn-compteur' }, `Fig. ${i + 1}`)),
          h('div', { classe: 'cn-corps' }, h('header', { classe: 'cn-tete' }, h('strong', {}, s.titre)), figureApercu(s))))] : null));
  document.body.append(fenetre);

  let releve = null;
  const charger = async () => {
    let c;
    try { c = await (await fetch(`/api/executions/${x.id}/carnet`)).json(); } catch { return; }
    const vivante = ['en-cours', 'en-pause'].includes(c.suivi?.etat);
    etat.replaceChildren(c.suivi?.etat ? pilule(c.suivi.etat) : pilule('prevue'));
    // On ne remplace que les sorties : la lecture du code, au-dessus, ne bouge pas.
    const hauteur = sorties.offsetHeight;
    sorties.replaceChildren(...[
      c.commande ? h('section', { classe: 'cn-cellule', 'data-genre': 'commande' },
        h('div', { classe: 'cn-marge' }, h('span', { classe: 'cn-compteur' }, `In [${x.code.length + 1}]`)),
        h('div', { classe: 'cn-corps' }, h('header', { classe: 'cn-tete' }, h('strong', {}, 'La commande lancée'), h('span', { classe: 'meta cn-temps' }, c.debut ? dateLongue(c.debut) : '')),
          h('pre', { classe: 'journal cn-sortie cn-commande' }, c.commande))) : null,
      !c.journal ? h('p', { classe: 'doux' }, c.suivi?.etat ? 'Le journal n’est pas sur cette machine.' : 'Cette exécution n’a pas encore été lancée : il n’y a rien à montrer.') : null,
      c.tronque ? h('p', { classe: 'meta' }, 'Journal très long : seule la fin est montrée.') : null,
      ...c.cellules.map((cellule, i) => sortie(cellule, i + 1)),
      c.journal && !c.brut ? h('p', { classe: 'meta cn-muet' }, 'Journal condensé, tel qu’il est historisé dans le dépôt.') : null,
    ].filter(Boolean));
    sorties.style.minHeight = vivante ? `${hauteur}px` : '';
    if (!vivante && releve) { clearInterval(releve); releve = null; }
    return vivante;
  };
  charger().then((vivante) => { if (vivante && fenetre.open) releve = setInterval(() => { if (!document.hidden) charger(); }, 3000); });
  fenetre.addEventListener('close', () => { clearInterval(releve); fenetre.remove(); });
  fenetre.addEventListener('click', (e) => { if (e.target === fenetre) fenetre.close(); });
  fenetre.showModal();
}
