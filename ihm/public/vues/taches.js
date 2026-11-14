// Vue « Tâches » : un tableau à quatre colonnes. Déplacer une tâche réécrit son fichier dans pilotage/taches/.
import { embleme } from '../emblemes.js';
import { LIBELLES, adresse, dateCourte, envoyer, glyphe, h, lier } from '../outils.js';

const COLONNES = ['a-faire', 'en-cours', 'bloquee', 'faite'];

export function vueTaches(vue, app, params) {
  const { taches, pistes } = app.etat;
  const visee = params.get('id');
  const filtre = params.get('piste');
  const visibles = filtre ? taches.filter((t) => t.piste === filtre) : taches;
  const domaineDe = (id) => pistes.find((p) => p.id === id)?.domaine ?? 'defi';
  const titrePiste = (id) => pistes.find((p) => p.id === id)?.titre ?? id;

  const deplacer = async (t, statut) => {
    try {
      await envoyer('PATCH', `/api/taches/${t.id}`, { statut });
      await app.recharger();
    } catch (e) { alert(e.message); }
  };

  const fiche = (t) => {
    const i = COLONNES.indexOf(t.statut);
    return h('article', { classe: `tache ${t.id === visee ? 'visee' : ''}`, 'data-statut': t.statut, id: t.id },
      h('div', { style: 'display:flex;justify-content:space-between;align-items:center' },
        h('span', { classe: 'meta avec-embleme serre' }, embleme(domaineDe(t.piste), 24), t.id),
        h('span', { classe: 'priorite', title: `Priorité ${t.priorite}`, 'aria-label': `Priorité ${t.priorite} sur 3` },
          [1, 2, 3].map((n) => h('i', { classe: n <= 4 - t.priorite ? 'on' : '' })))),
      h('h3', { classe: 'tache-titre' }, t.titre),
      h('div', { classe: 'meta' }, t.responsable, t.echeance ? ` · pour le ${dateCourte(t.echeance)}` : ''),
      t.note ? h('details', {}, h('summary', {}, 'Ce qui définit « fait »'), lier(h('div', { classe: 'prose', html: t.noteHtml }))) : null,
      h('div', { classe: 'tache-pied' },
        h('a', { classe: 'pilule', href: adresse(t.piste), title: titrePiste(t.piste) }, embleme('carte', 15), t.piste),
        t.issue ? h('span', { classe: 'pilule' }, `issue #${t.issue}`) : null,
        h('span', { style: 'margin-left:auto;display:flex;gap:6px' },
          i > 0 ? h('button', { classe: 'bouton mini discret', type: 'button', 'aria-label': `Remettre ${t.id} dans « ${LIBELLES[COLONNES[i - 1]]} »`, onclick: () => deplacer(t, COLONNES[i - 1]) }, '←') : null,
          i < COLONNES.length - 1 ? h('button', { classe: 'bouton mini discret', type: 'button', 'aria-label': `Passer ${t.id} dans « ${LIBELLES[COLONNES[i + 1]]} »`, onclick: () => deplacer(t, COLONNES[i + 1]) }, '→') : null)));
  };

  vue.append(
    h('div', { classe: 'vue-tete' },
      h('div', {}, h('p', { classe: 'meta' }, '03/06 · Gestion de projet'), h('h1', { classe: 'grand' }, 'Les tâches')),
      filtre
        ? h('p', {}, `Filtre : ${filtre} — ${titrePiste(filtre)}. `, h('a', { href: '#/taches' }, 'Tout afficher'))
        : h('p', { classe: 'doux' }, 'Chaque tâche sert une piste de la carte. Les flèches la déplacent et réécrivent son fichier.')),
    h('div', { classe: 'tableau' }, COLONNES.map((statut) => {
      const liste = visibles.filter((t) => t.statut === statut).sort((a, b) => a.priorite - b.priorite || a.id.localeCompare(b.id));
      return h('section', { classe: 'colonne', 'aria-label': LIBELLES[statut] },
        h('div', { classe: 'colonne-tete' }, h('h2', { classe: 'cond', style: 'display:flex;align-items:center;gap:8px' }, glyphe(statut), LIBELLES[statut]), h('span', { classe: 'numero' }, liste.length)),
        liste.length ? liste.map(fiche) : h('p', { classe: 'meta', style: 'padding:8px' }, 'Rien ici.'));
    })));

  if (visee) document.getElementById(visee)?.scrollIntoView({ block: 'center' });
}
