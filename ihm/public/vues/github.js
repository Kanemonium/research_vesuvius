// Vue « GitHub » : l'état du dépôt local et le mouvement du dépôt distant.
import { embleme } from '../emblemes.js';
import { h, ilYA, lienId } from '../outils.js';

const ETATS_CI = { success: 'réussie', failure: 'en échec', cancelled: 'annulée', skipped: 'ignorée' };

const EMBLEMES = { 'Sur cette machine': 'mouvement', GitHub: 'github', 'Contrôles automatiques': 'taches', 'Demandes de fusion et issues': 'boite' };
const AGRANDIR = '<svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path class="gh-ouvrir" d="M12 3.5h4.5V8M8 16.5H3.5V12M16.5 3.5l-5 5M3.5 16.5l5-5"/><path class="gh-reduire" d="M16.5 8H12V3.5M3.5 12H8v4.5M12 8l4.5-4.5M8 12l-4.5 4.5"/></svg>';
const calme = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Agrandit un panneau jusqu'à couvrir la grille, ou le remet à sa place. Les autres glissent dessous. */
function basculerPanneau(section) {
  const grille = section.closest('.gh-grille');
  const cadre = grille.getBoundingClientRect();
  const bouton = section.querySelector('.gh-agrandir');
  const duree = calme() ? 0 : 420;
  const options = { duration: duree, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' };
  const marges = (r) => `inset(${r.top - cadre.top}px ${cadre.right - r.right}px ${cadre.bottom - r.bottom}px ${r.left - cadre.left}px round 14px)`;
  if (section.dataset.agrandi !== 'oui') {
    const avant = section.getBoundingClientRect();
    // Une place vide garde la case du panneau dans la grille pendant qu'il la quitte.
    const place = h('div', { classe: 'gh-place', 'aria-hidden': 'true' });
    section.before(place);
    section.dataset.agrandi = 'oui';
    grille.dataset.agrandi = 'oui';
    bouton.setAttribute('aria-label', 'Réduire le panneau');
    bouton.setAttribute('aria-expanded', 'true');
    section.animate([{ clipPath: marges(avant) }, { clipPath: 'inset(0 round 14px)' }], options);
    return;
  }
  const place = grille.querySelector('.gh-place');
  const cible = place.getBoundingClientRect();
  delete grille.dataset.agrandi;
  bouton.setAttribute('aria-label', 'Agrandir le panneau');
  bouton.setAttribute('aria-expanded', 'false');
  const fin = () => { delete section.dataset.agrandi; place.remove(); };
  if (!duree) { fin(); return; }
  section.animate([{ clipPath: 'inset(0 round 14px)' }, { clipPath: marges(cible) }], options).finished.then(fin, fin);
}

function bloc(titre, meta, ...contenu) {
  const section = h('section', { classe: 'carte gh-panneau' },
    h('div', { classe: 'carte-tete' }, h('h2', { classe: 'cond avec-embleme' }, embleme(EMBLEMES[titre], 30), titre), h('span', { classe: 'meta' }, meta),
      h('button', { classe: 'gh-agrandir', type: 'button', 'aria-label': 'Agrandir le panneau', 'aria-expanded': 'false', html: AGRANDIR, onclick: () => basculerPanneau(section) })),
    h('div', { classe: 'gh-corps' }, contenu));
  return section;
}
const lignes = (elements, rendre, vide) => (elements?.length ? h('ul', { classe: 'liste' }, elements.map((e) => h('li', {}, rendre(e)))) : h('p', { classe: 'doux' }, vide));

export function vueGithub(vue, app) {
  vue.classList.add('gh-vue'); // la vue tient dans la hauteur de l'écran : chaque panneau défile pour lui-même
  const corps = h('div', { classe: 'grille col-2 gh-grille' }, h('p', { classe: 'doux' }, 'Lecture du dépôt…'));
  vue.append(
    h('div', { classe: 'vue-tete' },
      h('div', {}, h('p', { classe: 'meta' }, '04/06 · Mouvement'), h('h1', { classe: 'grand' }, 'Le dépôt')),
      h('p', { classe: 'doux' }, "Le jeton reste dans le serveur local : il n'atteint jamais cette page.")),
    corps);

  app.github().then((g) => {
    const { local, depot } = g;
    const blocLocal = bloc('Sur cette machine', local.depot ? `branche ${local.branche}` : 'pas de dépôt',
      local.depot ? [
        h('p', {}, local.modifies
          ? `${local.modifies} fichier${local.modifies > 1 ? 's' : ''} modifié${local.modifies > 1 ? 's' : ''} ou nouveau${local.modifies > 1 ? 'x' : ''}, pas encore enregistré${local.modifies > 1 ? 's' : ''}.`
          : 'Rien en attente : tout est enregistré.'),
        h('p', { classe: 'doux', style: 'margin:6px 0 12px' }, local.distant ? `Relié à ${local.distant.replace(/^https:\/\/[^@]*@/, 'https://')}` : "Aucun dépôt distant n'est encore relié."),
        lignes(local.commits, (c) => [h('span', { classe: 'mono' }, c.sha), h('span', {}, c.message), h('span', { classe: 'fin meta' }, ilYA(c.date))], 'Aucun commit pour l’instant.'),
      ] : h('p', { classe: 'doux' }, 'Ce dossier n’est pas un dépôt git.'));

    if (!g.connecte) {
      corps.replaceChildren(blocLocal, bloc('GitHub', 'non connecté', h('div', { classe: 'vide' }, g.raison, ' Voir .env.example.')));
      return;
    }
    const compte = h('p', {}, 'Connecté en tant que ', h('a', { href: g.compte.url, target: '_blank', rel: 'noreferrer' }, g.compte.login), '.');
    if (!depot) {
      corps.replaceChildren(blocLocal, bloc('GitHub', 'aucun dépôt distant', compte,
        h('div', { classe: 'vide', style: 'margin-top:12px' },
          'Rien n’est encore publié. Quand le dépôt sera créé et relié (tâche ', lienId('T-006'),
          '), ses commits, ses demandes de fusion, ses issues et ses contrôles automatiques apparaîtront ici.')));
      return;
    }
    if (depot.erreur) {
      corps.replaceChildren(blocLocal, bloc('GitHub', depot.nom, compte, h('div', { classe: 'vide', style: 'margin-top:12px' }, `GitHub répond ${depot.erreur} pour ce dépôt : il n’existe pas, ou le jeton n’y a pas accès.`)));
      return;
    }
    const lienExt = (url, texte) => h('a', { href: url, target: '_blank', rel: 'noreferrer' }, texte);
    corps.replaceChildren(
      blocLocal,
      bloc('GitHub', depot.prive ? 'privé' : 'public', compte,
        h('p', { style: 'margin:6px 0 12px' }, lienExt(depot.url, depot.nom), ` · dernier envoi ${ilYA(depot.pousse)}`),
        lignes(depot.commits, (c) => [h('span', { classe: 'mono' }, c.sha), lienExt(c.url, c.message), h('span', { classe: 'fin meta' }, ilYA(c.date))], 'Aucun commit.')),
      bloc('Contrôles automatiques', 'CI', lignes(depot.runs, (r) => [
        h('span', { classe: 'pilule', 'data-statut': r.conclusion === 'success' ? 'faite' : r.conclusion === 'failure' ? 'bloquee' : 'en-cours' }, r.conclusion ? ETATS_CI[r.conclusion] ?? r.conclusion : 'en cours'),
        lienExt(r.url, `${r.nom} · ${r.branche}`), h('span', { classe: 'fin meta' }, ilYA(r.date))], 'Aucune exécution pour l’instant.')),
      bloc('Demandes de fusion et issues', `${depot.prs.length + depot.issues.length}`,
        lignes([...depot.prs.map((p) => ({ ...p, genre: 'PR' })), ...depot.issues.map((i) => ({ ...i, genre: 'issue' }))], (e) => [
          h('span', { classe: 'pilule' }, `${e.genre} #${e.numero}`), lienExt(e.url, e.titre), h('span', { classe: 'fin meta' }, `${e.etat} · ${ilYA(e.date)}`)], 'Rien d’ouvert.')));
  }).catch((e) => corps.replaceChildren(h('div', { classe: 'bandeau', role: 'alert' }, `Lecture impossible : ${e.message}`)));
}
