// Vue « Tâches » : un tableau à quatre colonnes, et derrière chaque carte le détail de la tâche.
// Cliquer une carte fait glisser le tableau hors de l'écran, vers la gauche, pour laisser la place au détail :
// ce que la tâche demande, puis les étapes et les bugs qu'elle a traversés (clé « etapes » de son fichier).
// Déplacer une tâche réécrit son fichier dans pilotage/taches/.
import { embleme } from '../emblemes.js';
import { LIBELLES, adresse, dateCourte, dateLongue, envoyer, glyphe, h, lienId, lier, pilule } from '../outils.js';

// « Bloquée » est à part, à droite de « Faite », derrière un filet : ce n'est pas une étape du parcours.
const COLONNES = ['a-faire', 'en-cours', 'faite', 'bloquee'];
// Où mènent les flèches d'une carte : [vers la gauche, vers la droite]. Une tâche bloquée repart en cours.
const VOISINS = { 'a-faire': [null, 'en-cours'], 'en-cours': ['a-faire', 'faite'], faite: ['en-cours', null], bloquee: ['en-cours', null] };
const SENS_INTERDIT = '<svg viewBox="0 0 20 20" width="13" height="13" aria-hidden="true"><circle cx="10" cy="10" r="7" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5.2 14.8 14.8 5.2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
// Dernier volet montré et dernière tâche ouverte : servent à animer le passage de l'un à l'autre.
let voletPrecedent = null;
let derniereOuverte = null;

const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`;

export function vueTaches(vue, app, params) {
  const { taches, pistes, executions } = app.etat;
  const filtre = params.get('piste');
  const ouverte = taches.find((t) => t.id === params.get('id')) ?? null;
  const volet = ouverte ? 'detail' : 'tableau';
  const visibles = filtre ? taches.filter((t) => t.piste === filtre) : taches;
  const domaineDe = (id) => pistes.find((p) => p.id === id)?.domaine ?? 'defi';
  const titrePiste = (id) => pistes.find((p) => p.id === id)?.titre ?? id;
  const retour = filtre ? `#/taches?piste=${filtre}` : '#/taches';
  const ouvrir = (t) => `#/taches?id=${t.id}${filtre ? `&piste=${filtre}` : ''}`;

  const deplacer = async (t, statut) => {
    try {
      await envoyer('PATCH', `/api/taches/${t.id}`, { statut });
      await app.recharger();
    } catch (e) { alert(e.message); }
  };
  const fleches = (t) => {
    const [avant, apres] = VOISINS[t.statut] ?? [null, null];
    const bloquable = t.statut === 'a-faire' || t.statut === 'en-cours';
    return h('span', { classe: 'tache-fleches' },
      bloquable ? h('button', { classe: 'bouton mini discret tache-bloquer', type: 'button', title: 'Bloquer', 'aria-label': `Passer ${t.id} dans « ${LIBELLES.bloquee} »`, html: SENS_INTERDIT, onclick: () => deplacer(t, 'bloquee') }) : null,
      avant ? h('button', { classe: 'bouton mini discret', type: 'button', 'aria-label': `Remettre ${t.id} dans « ${LIBELLES[avant]} »`, onclick: () => deplacer(t, avant) }, '←') : null,
      apres ? h('button', { classe: 'bouton mini discret', type: 'button', 'aria-label': `Passer ${t.id} dans « ${LIBELLES[apres]} »`, onclick: () => deplacer(t, apres) }, '→') : null);
  };
  const priorite = (t) => h('span', { classe: 'priorite', title: `Priorité ${t.priorite}`, 'aria-label': `Priorité ${t.priorite} sur 3` },
    [1, 2, 3].map((n) => h('i', { classe: n <= 4 - t.priorite ? 'on' : '' })));
  const compte = (t) => {
    const bugs = t.etapes.filter((e) => e.genre === 'bug').length;
    const etapes = t.etapes.length - bugs;
    if (!t.etapes.length) return null;
    return h('span', { classe: 'meta tache-compte' }, pluriel(etapes, 'étape'), bugs ? [' · ', h('b', {}, pluriel(bugs, 'bug'))] : null);
  };

  // ---------- Volet 1 : le tableau ----------
  const carte = (t) => h('article', {
    classe: 'tache', 'data-statut': t.statut, id: t.id,
    onclick: (e) => { if (!e.target.closest('a, button')) location.hash = ouvrir(t); },
  },
    h('div', { style: 'display:flex;justify-content:space-between;align-items:center' },
      h('span', { classe: 'meta avec-embleme serre' }, embleme(domaineDe(t.piste), 24), t.id), priorite(t)),
    h('h3', { classe: 'tache-titre' }, h('a', { href: ouvrir(t) }, t.titre)),
    h('div', { classe: 'meta' }, t.responsable, t.echeance ? ` · pour le ${dateCourte(t.echeance)}` : ''),
    compte(t),
    h('div', { classe: 'tache-pied' },
      h('a', { classe: 'pilule', href: adresse(t.piste), title: titrePiste(t.piste) }, embleme('carte', 15), t.piste),
      t.issue ? h('span', { classe: 'pilule' }, `issue #${t.issue}`) : null,
      fleches(t)));

  const tableau = h('div', { classe: 'glisse-volet' },
    h('div', { classe: 'vue-tete' },
      h('div', {}, h('p', { classe: 'meta' }, '02/06 · Gestion de projet'), h('h1', { classe: 'grand' }, 'Les tâches')),
      filtre
        ? h('p', {}, `Filtre : ${filtre} — ${titrePiste(filtre)}. `, h('a', { href: '#/taches' }, 'Tout afficher'))
        : h('p', { classe: 'doux' }, 'Chaque tâche sert une piste de la carte. Cliquer une carte ouvre son détail : ses étapes et ses bugs.')),
    h('div', { classe: 'tableau' }, COLONNES.map((statut) => {
      const liste = visibles.filter((t) => t.statut === statut).sort((a, b) => a.priorite - b.priorite || a.id.localeCompare(b.id));
      return h('section', { classe: 'colonne', 'data-colonne': statut, 'aria-label': LIBELLES[statut] },
        h('div', { classe: 'colonne-tete' }, h('h2', { classe: 'cond', style: 'display:flex;align-items:center;gap:8px' }, glyphe(statut), LIBELLES[statut]), h('span', { classe: 'numero' }, liste.length)),
        liste.length ? liste.map(carte) : h('p', { classe: 'meta', style: 'padding:8px' }, 'Rien ici.'));
    })));

  // ---------- Volet 2 : le détail d'une tâche ----------
  const etape = (e, n) => {
    const bug = e.genre === 'bug';
    return h('li', { classe: 'etape', 'data-genre': e.genre, 'data-statut': e.statut },
      h('span', { classe: 'etape-repere', 'aria-hidden': 'true' }, bug ? embleme('probleme', 26) : h('span', { classe: 'numero' }, n)),
      h('div', { classe: 'etape-corps' },
        h('div', { classe: 'etape-tete' },
          h('span', { classe: 'etiquette' }, bug ? 'Bug' : 'Étape'),
          pilule(e.statut),
          e.date ? h('span', { classe: 'meta' }, dateCourte(e.date)) : null),
        h('h4', { classe: 'etape-titre' }, e.titre),
        e.detailHtml ? lier(h('div', { classe: 'prose', html: e.detailHtml })) : null));
  };

  const detail = (t) => {
    let n = 0;
    const bugs = t.etapes.filter((e) => e.genre === 'bug');
    const courses = executions.filter((x) => x.taches.includes(t.id));
    return h('article', { classe: 'tache-detail' },
      h('a', { classe: 'bouton discret', href: retour }, '← Le tableau'),
      h('div', { classe: 'tiroir-tete', style: 'margin-top:20px' }, embleme(domaineDe(t.piste), 44), h('span', { classe: 'etiquette' }, t.id), pilule(t.statut), priorite(t)),
      h('h1', { classe: 'fiche-titre' }, t.titre),
      h('div', { classe: 'detail-grille' },
        h('section', {},
          h('div', { classe: 'detail-entete' },
            h('h2', { classe: 'cond' }, 'Le parcours'),
            h('span', { classe: 'meta' }, t.etapes.length ? `${pluriel(t.etapes.length - bugs.length, 'étape')} · ${pluriel(bugs.length, 'bug')}` : 'rien de consigné')),
          t.etapes.length
            ? h('ol', { classe: 'parcours' }, t.etapes.map((e) => etape(e, e.genre === 'bug' ? 0 : ++n)))
            : h('p', { classe: 'vide' }, 'Aucune étape consignée pour cette tâche. Elles s’écrivent dans son fichier, sous la clé « etapes ».')),
        h('aside', { classe: 'detail-cote' },
          h('section', { classe: 'carte' },
            h('h2', { classe: 'cond' }, 'Ce qui définit « fait »'),
            t.note ? lier(h('div', { classe: 'prose', style: 'margin-top:12px', html: t.noteHtml })) : h('p', { classe: 'doux', style: 'margin-top:12px' }, 'Non précisé.')),
          h('section', { classe: 'carte' },
            h('dl', { classe: 'fiche-faits' },
              h('dt', {}, 'Sert la piste'), h('dd', {}, h('a', { classe: 'pilule', href: adresse(t.piste) }, embleme('carte', 15), `${t.piste} · ${titrePiste(t.piste)}`)),
              h('dt', {}, 'Responsable'), h('dd', {}, t.responsable ?? 'non précisé'),
              h('dt', {}, 'Créée le'), h('dd', {}, t.creee ? dateLongue(t.creee) : 'inconnu'),
              t.echeance ? [h('dt', {}, 'Échéance'), h('dd', {}, dateLongue(t.echeance))] : null,
              t.issue ? [h('dt', {}, 'Issue GitHub'), h('dd', {}, `#${t.issue}`)] : null,
              courses.length ? [h('dt', {}, 'Exécutions'), h('dd', { classe: 'fiche-pistes' }, courses.map((x) => lienId(x.id)))] : null,
              h('dt', {}, 'Fichier'), h('dd', { classe: 'mono' }, t.fichier)),
            h('div', { classe: 'detail-deplacer' }, h('span', { classe: 'meta' }, 'Déplacer'), fleches(t))))));
  };

  const montree = ouverte ?? taches.find((t) => t.id === derniereOuverte) ?? null;
  const voletDetail = h('div', { classe: 'glisse-volet' }, montree ? detail(montree) : null);
  const rail = h('div', { classe: 'glisse-rail' }, tableau, voletDetail);
  vue.append(h('div', { classe: 'glisse' }, rail));

  // Le volet quitté reste en place le temps du glissement, puis il est replié pour ne pas allonger la page.
  const ranger = () => {
    tableau.classList.toggle('hors', volet === 'detail');
    voletDetail.classList.toggle('hors', volet === 'tableau');
  };
  if (app.depuis === 'taches' && voletPrecedent && voletPrecedent !== volet) {
    rail.dataset.volet = voletPrecedent;
    requestAnimationFrame(() => requestAnimationFrame(() => { rail.dataset.volet = volet; }));
    rail.addEventListener('transitionend', ranger, { once: true });
    setTimeout(ranger, 800);
    scrollTo({ top: 0 });
  } else {
    rail.dataset.volet = volet;
    ranger();
  }
  voletPrecedent = volet;
  if (ouverte) derniereOuverte = ouverte.id;
}
