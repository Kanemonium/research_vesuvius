// Vue « Cap » : où nous en sommes, ce qui vient, et la boîte d'Agent C.
import { adresse, dateCourte, envoyer, h, ilYA, joursAvant, lier, pilule } from '../outils.js';

export function vueCap(vue, app) {
  const { pistes, taches, horizon, boite } = app.etat;
  const ouvertes = taches.filter((t) => t.statut !== 'faite');
  const enCours = taches.filter((t) => t.statut === 'en-cours');
  const pistesActives = pistes.filter((p) => p.statut === 'en-cours' && p.type !== 'racine' && p.type !== 'domaine');
  const prochaine = horizon.echeances.filter((e) => joursAvant(e.date) >= 0).sort((a, b) => String(a.date).localeCompare(String(b.date)))[0];
  const jours = joursAvant(app.grandPrix);
  const aVenir = [...ouvertes].sort((a, b) => (a.statut === 'en-cours' ? -1 : 0) - (b.statut === 'en-cours' ? -1 : 0) || a.priorite - b.priorite || a.id.localeCompare(b.id)).slice(0, 5);

  const briefing = h('p', { classe: 'briefing' },
    'Bonjour. ', h('b', {}, `${ouvertes.length} tâche${ouvertes.length > 1 ? 's' : ''} ouverte${ouvertes.length > 1 ? 's' : ''}`),
    `, dont ${enCours.length} en cours. `,
    pistesActives.length ? `Nous travaillons sur ${pistesActives.map((p) => p.id).join(' et ')}. ` : 'Aucune piste active. ',
    prochaine ? `Prochaine échéance : ${prochaine.titre.toLowerCase()}, le ${dateCourte(prochaine.date)} (dans ${joursAvant(prochaine.date)} jours).` : '');

  const tuile = (nombre, libelle, href) => h('a', { classe: 'tuile', href },
    h('div', { classe: 'tuile-nombre' }, nombre), h('div', { classe: 'meta' }, libelle));

  vue.append(h('section', { classe: 'hero' },
    h('div', { classe: 'hero-coins' }, h('span', { classe: 'meta' }, 'Vesuvius Challenge · carnet de bord'), h('span', { classe: 'meta' }, '01/05 →')),
    h('h1', { classe: 'geant hero-titre' },
      h('span', {}, 'Lire'),
      h('span', { classe: 'hero-carre', title: `${jours} jours avant l'échéance du Grand Prix` }, h('span', {}, 'J-', h('b', {}, jours))),
      h('span', {}, 'sous'), h('span', {}, 'la'), h('span', {}, 'cendre')),
    h('div', { classe: 'hero-bas' },
      lier(briefing),
      h('div', { classe: 'tuiles' },
        tuile(pistes.filter((p) => p.type === 'piste').length, 'pistes sur la carte', '#/carte'),
        tuile(ouvertes.length, 'tâches ouvertes', '#/taches'),
        tuile(horizon.livrables.length, 'livrables projetés', '#/horizon'),
        tuile(jours, 'jours avant le 25 juin 2027', '#/horizon')))));

  const carteTaches = h('section', { classe: 'carte' },
    h('div', { classe: 'carte-tete' }, h('h2', { classe: 'cond' }, 'À faire maintenant'), h('a', { classe: 'meta', href: '#/taches' }, 'Tout voir →')),
    h('ol', { classe: 'liste' }, aVenir.map((t, i) => h('li', {},
      h('span', { classe: 'numero' }, i + 1),
      h('div', {}, h('a', { href: adresse(t.id), style: 'text-decoration:none;font-weight:600' }, t.titre),
        h('div', { classe: 'meta', style: 'margin-top:4px' }, `${t.id} · ${t.responsable}`)),
      h('span', { classe: 'fin' }, pilule(t.statut))))));

  // Boîte : un mot laissé ici attend Agent C. dans pilotage/boite.md.
  const champ = h('textarea', { classe: 'champ', rows: 3, placeholder: 'Une idée, une question, une piste à creuser…', 'aria-label': 'Message pour Agent C.' });
  const retour = h('span', { classe: 'meta', role: 'status' });
  const carteBoite = h('section', { classe: 'carte' },
    h('div', { classe: 'carte-tete' }, h('h2', { classe: 'cond' }, "Boîte d'Agent C."), h('span', { classe: 'meta' }, `${boite.length} en attente`)),
    h('p', { classe: 'doux', style: 'margin-bottom:12px' }, 'Écrivez ici entre deux séances. Je lis la boîte en ouvrant la suivante.'),
    h('form', { onsubmit: async (e) => {
      e.preventDefault();
      try {
        await envoyer('POST', '/api/boite', { texte: champ.value });
        await app.recharger();
      } catch (err) { retour.textContent = err.message; }
    } }, champ, h('div', { style: 'display:flex;align-items:center;gap:12px;margin-top:10px' }, h('button', { classe: 'bouton', type: 'submit' }, 'Déposer'), retour)),
    boite.length ? h('ul', { classe: 'liste', style: 'margin-top:12px' }, boite.map((m) => {
      const [, quand, texte] = /^\*\*(.+?)\*\* : ([\s\S]*)$/.exec(m) ?? [null, '', m];
      return h('li', {}, h('div', {}, h('div', { classe: 'meta' }, quand), lier(h('div', {}, texte))));
    })) : null);

  const corpsGit = h('div', { classe: 'doux' }, 'Lecture du dépôt…');
  const carteGit = h('section', { classe: 'carte' },
    h('div', { classe: 'carte-tete' }, h('h2', { classe: 'cond' }, 'Dernier mouvement'), h('a', { classe: 'meta', href: '#/github' }, 'GitHub →')), corpsGit);
  app.github().then((g) => {
    const commits = g.depot?.commits?.length ? g.depot.commits : g.local.commits ?? [];
    if (!commits.length) {
      corpsGit.replaceChildren(g.local.depot
        ? `Dépôt local sur la branche « ${g.local.branche} », aucun commit pour l'instant. ${g.local.modifies} fichier(s) en attente.`
        : 'Aucun dépôt git dans ce dossier.');
      return;
    }
    corpsGit.replaceChildren(h('ul', { classe: 'liste' }, commits.slice(0, 4).map((c) => h('li', {},
      h('span', { classe: 'mono' }, c.sha), h('span', {}, c.message), h('span', { classe: 'fin meta' }, ilYA(c.date))))));
  }).catch(() => corpsGit.replaceChildren('Mouvement indisponible.'));

  vue.append(h('div', { classe: 'grille col-3' }, carteTaches, carteBoite, carteGit));
}
