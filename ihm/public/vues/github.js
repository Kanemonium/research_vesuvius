// Vue « GitHub » : l'état du dépôt local et le mouvement du dépôt distant.
import { embleme } from '../emblemes.js';
import { h, ilYA } from '../outils.js';

const ETATS_CI = { success: 'réussie', failure: 'en échec', cancelled: 'annulée', skipped: 'ignorée' };

const EMBLEMES = { 'Sur cette machine': 'mouvement', GitHub: 'github', 'Contrôles automatiques': 'taches', 'Demandes de fusion et issues': 'boite' };
function bloc(titre, meta, ...contenu) {
  return h('section', { classe: 'carte' }, h('div', { classe: 'carte-tete' }, h('h2', { classe: 'cond avec-embleme' }, embleme(EMBLEMES[titre], 30), titre), h('span', { classe: 'meta' }, meta)), contenu);
}
const lignes = (elements, rendre, vide) => (elements?.length ? h('ul', { classe: 'liste' }, elements.map((e) => h('li', {}, rendre(e)))) : h('p', { classe: 'doux' }, vide));

export function vueGithub(vue, app) {
  const corps = h('div', { classe: 'grille col-2' }, h('p', { classe: 'doux' }, 'Lecture du dépôt…'));
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
          'Rien n’est encore publié. Quand le dépôt sera créé et relié (tâche ', h('a', { href: '#/taches?id=T-006', classe: 'lien-id' }, 'T-006'),
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
