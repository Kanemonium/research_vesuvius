// Vue « Exécutions » : ce que nous avons fait tourner, rendu lisible.
// Pour chaque exécution : ce qu'elle a produit, le code utile avec sa lecture annotée, puis les sorties.
// Les rendus sont des fichiers experiments/<dossier>/execution.yaml ; le format est dans pilotage/README.md.
import { figureApercu } from '../apercu.js';
import { boutonCarnet } from '../carnet.js';
import { embleme } from '../emblemes.js';
import { adresse, avecBulle, compteGithub, credit, dateLongue, h, lienId, lier, pilule, s } from '../outils.js';
import { avancement, boutonJournal, boutonPause, etatDe, majSuivi } from '../suivi.js';

const GENRES = {
  parametrage: { nom: 'Paramétrage', couleur: 'var(--ev-ciel)' },
  architecture: { nom: 'Architecture', couleur: 'var(--ev-violet)' },
  optimisation: { nom: 'Optimisation', couleur: 'var(--ev-braise)' },
  donnees: { nom: 'Données', couleur: 'var(--ev-turquoise)' },
  mesure: { nom: 'Mesure', couleur: 'var(--ev-pre)' },
};
const nombre = (v) => (typeof v === 'number' ? v.toLocaleString('fr-FR', { maximumSignificantDigits: 4 }) : String(v));
const fichesLiees = (ids) => (ids.length ? h('p', { classe: 'note-fiches' }, ids.map((id) => lienId(id))) : null);

/** Un extrait de code et, à sa droite, les notes qui l'expliquent. Survoler une note éclaire ses lignes. */
function codeAnnote(bloc) {
  const lignes = bloc.lignes.map((texte, i) => {
    const n = bloc.debut + i;
    const notes = bloc.notes.map((note, k) => ({ note, k })).filter(({ note }) => n >= note.lignes[0] && n <= note.lignes[1]);
    const premiere = notes.find(({ note }) => note.lignes[0] === n);
    return h('div', { classe: `cl ${notes.length ? 'notee' : ''}`, 'data-notes': notes.map(({ k }) => k).join(' ') },
      h('span', { classe: 'cl-n' }, n),
      h('span', { classe: 'cl-m' }, premiere ? h('span', { classe: 'numero', style: `background:${GENRES[premiere.note.genre]?.couleur ?? 'var(--encre)'}` }, premiere.k + 1) : null),
      h('span', { classe: 'cl-t' }, texte || ' '));
  });
  const eclairer = (k, oui) => {
    for (const l of lignes) if (l.dataset.notes.split(' ').includes(String(k))) l.classList.toggle('vive', oui);
  };
  const notes = bloc.notes.map((note, k) => {
    const g = GENRES[note.genre] ?? { nom: note.genre, couleur: 'var(--encre)' };
    const el = h('li', { classe: 'note', tabindex: 0, style: `--genre:${g.couleur}` },
      h('div', { classe: 'note-tete' },
        h('span', { classe: 'numero', style: `background:${g.couleur}` }, k + 1),
        h('span', { classe: 'meta' }, g.nom),
        h('span', { classe: 'meta note-lignes' }, note.lignes[0] === note.lignes[1] ? `ligne ${note.lignes[0]}` : `lignes ${note.lignes[0]}–${note.lignes[1]}`)),
      h('h4', { classe: 'note-titre' }, note.titre),
      lier(h('div', { classe: 'prose', html: note.texteHtml })),
      fichesLiees(note.fiches));
    for (const [evt, oui] of [['pointerenter', true], ['pointerleave', false], ['focus', true], ['blur', false]]) el.addEventListener(evt, () => eclairer(k, oui));
    return el;
  });
  const origine = bloc.fichier
    ? h('span', { classe: 'mono' }, bloc.fichier)
    : bloc.source && (bloc.auteur ?? compteGithub(bloc.source))
      ? h('span', { classe: 'code-auteur' }, h('span', { classe: 'meta' }, 'Code de'), credit(bloc.auteur ?? compteGithub(bloc.source), `${bloc.origine ?? bloc.source} ↗`, bloc.source))
      : bloc.source ? h('a', { classe: 'mono', href: bloc.source, target: '_blank', rel: 'noreferrer' }, `${bloc.origine ?? bloc.source} ↗`) : h('span', { classe: 'mono' }, bloc.origine ?? '');
  return h('section', { classe: 'code-annote' },
    h('div', { classe: 'code-entete' }, h('h3', { classe: 'titre' }, bloc.titre), origine),
    bloc.auteurs.length ? h('p', { classe: 'ecrit-par' }, h('span', { classe: 'meta' }, 'Écrit par'),
      bloc.auteurs.map((a) => {
        const depot = /^https:\/\/github\.com\/[^/]+\/[^/]+/.exec(bloc.source ?? '')?.[0];
        return h('span', { classe: 'ecrit-par-qui' }, credit(a.github, a.nom ? `${a.nom} (${a.github})` : a.github),
          depot ? h('a', { classe: 'mono', href: `${depot}/commit/${a.commit}`, target: '_blank', rel: 'noreferrer' }, `commit ${a.commit.slice(0, 7)} ↗`) : null,
          depot && a.pr ? h('a', { classe: 'mono', href: `${depot}/pull/${a.pr}`, target: '_blank', rel: 'noreferrer' }, `demande de fusion nº ${a.pr} ↗`) : null,
          a.date ? h('span', { classe: 'meta', style: 'text-transform:none;letter-spacing:0' }, dateLongue(a.date)) : null);
      })) : null,
    bloc.introHtml ? lier(h('div', { classe: 'prose doux', html: bloc.introHtml })) : null,
    h('div', { classe: 'code-grille' },
      h('div', { classe: 'code-bloc', role: 'group', 'aria-label': `Code : ${bloc.titre}` }, lignes),
      h('ol', { classe: 'notes' }, notes)));
}

/** Courbe à une seule série : trait d'encre, grille discrète, valeur exacte au survol de chaque point. */
function courbe(sortie) {
  const L = 560; const H = 250; const m = { g: 58, d: 18, h: 16, b: 42 };
  const xs = sortie.points.map((p) => p[0]); const ys = sortie.points.map((p) => p[1]);
  const x0 = sortie.xmin ?? Math.min(...xs); const x1 = sortie.xmax ?? Math.max(...xs);
  const y0 = sortie.ymin ?? Math.min(...ys); const y1 = sortie.ymax ?? Math.max(...ys);
  const X = (v) => m.g + ((v - x0) / (x1 - x0 || 1)) * (L - m.g - m.d);
  const Y = (v) => H - m.b - ((v - y0) / (y1 - y0 || 1)) * (H - m.h - m.b);
  const svg = s('svg', { classe: 'courbe', viewBox: `0 0 ${L} ${H}`, role: 'img', 'aria-label': `${sortie.titre} : ${sortie.y} selon ${sortie.x}` });
  for (let i = 0; i <= 4; i++) {
    const v = y0 + ((y1 - y0) * i) / 4;
    svg.append(s('line', { classe: 'g-grille', x1: m.g, x2: L - m.d, y1: Y(v), y2: Y(v) }),
      s('text', { classe: 'f-texte', x: m.g - 8, y: Y(v) + 4, 'text-anchor': 'end' }, nombre(Number(v.toPrecision(3)))));
  }
  for (let i = 0; i <= 4; i++) {
    const v = x0 + ((x1 - x0) * i) / 4;
    svg.append(s('text', { classe: 'f-texte', x: X(v), y: H - m.b + 18, 'text-anchor': 'middle' }, nombre(Math.round(v))));
  }
  svg.append(s('line', { classe: 'g-axe', x1: m.g, x2: L - m.d, y1: H - m.b, y2: H - m.b }),
    s('text', { classe: 'f-texte', x: (m.g + L - m.d) / 2, y: H - 6, 'text-anchor': 'middle' }, sortie.x),
    s('path', { classe: 'g-trait', d: sortie.points.map((p, i) => `${i ? 'L' : 'M'}${X(p[0]).toFixed(1)} ${Y(p[1]).toFixed(1)}`).join('') }));
  for (const p of sortie.points) {
    const point = s('g', { classe: 'g-point', tabindex: 0, role: 'img', 'aria-label': `${sortie.x} ${p[2] ?? nombre(p[0])} : ${nombre(p[1])}` },
      s('circle', { classe: 'cible', cx: X(p[0]), cy: Y(p[1]), r: 11 }), s('circle', { classe: 'marque-point', cx: X(p[0]), cy: Y(p[1]), r: 3.4 }));
    svg.append(avecBulle(point, () => [h('div', { classe: 'meta' }, `${sortie.x} ${p[2] ?? nombre(p[0])}`), h('strong', {}, nombre(p[1])), sortie.y]));
  }
  return h('figure', { classe: 'sortie-courbe' }, h('figcaption', { classe: 'meta' }, sortie.y), svg);
}

function sortieDe(sortie, x) {
  let corps;
  if (sortie.genre === 'mesures') {
    corps = h('table', { classe: 'mesures' }, h('tbody', {}, sortie.lignes.map((l) => h('tr', {}, h('th', { scope: 'row' }, l[0]), h('td', { classe: 'mesure-valeur' }, l[1]), h('td', { classe: 'doux' }, l[2] ?? '')))));
  } else if (sortie.genre === 'courbe') {
    corps = courbe(sortie);
  } else if (sortie.genre === 'image') {
    corps = figureApercu(sortie, { execution: x });
  } else if (sortie.genre === 'journal') {
    corps = h('pre', { classe: 'journal', tabindex: 0 }, String(sortie.texte ?? '').replace(/\n$/, ''));
  } else {
    corps = [sortie.lieu ? h('p', { classe: 'meta', style: 'text-transform:none;letter-spacing:0;margin-bottom:8px' }, `Dans ${sortie.lieu}`) : null,
      h('ul', { classe: 'liste fichiers' }, sortie.elements.map((f) => h('li', {},
        h('div', {}, h('div', { classe: 'mono' }, f.nom), lier(h('div', { classe: 'doux' }, f.role ?? ''))), h('span', { classe: 'fin meta' }, f.taille ?? ''))))];
  }
  return h('section', { classe: `carte sortie ${sortie.large ? 'large' : ''}` },
    h('div', { classe: 'carte-tete' }, h('h3', { classe: 'cond' }, sortie.titre), h('span', { classe: 'meta' }, { mesures: 'Mesures', courbe: 'Courbe', journal: 'Journal', fichiers: 'Fichiers', image: 'Image' }[sortie.genre])),
    corps,
    sortie.noteHtml ? lier(h('div', { classe: 'prose doux sortie-note', html: sortie.noteHtml })) : null);
}

// Tant qu'une exécution tourne, la page redemande sa progression toutes les deux secondes et ne
// retouche que les barres et les boutons : rien d'autre n'est redessiné.
let releveSuivi = null;
function suivreEnDirect(executions) {
  clearInterval(releveSuivi);
  releveSuivi = null;
  if (!executions.some((e) => ['en-cours', 'en-pause'].includes(etatDe(e)))) return;
  releveSuivi = setInterval(async () => {
    if (!document.querySelector('.exe-vue')) { clearInterval(releveSuivi); releveSuivi = null; return; }
    if (document.hidden) return;
    try { majSuivi(await (await fetch('/api/executions/suivi')).json()); } catch { /* serveur arrêté : on réessaiera */ }
  }, 2000);
}

export function vueExecutions(vue, app, params) {
  const { executions, pistes, taches } = app.etat;
  const x = executions.find((e) => e.id === params.get('id')) ?? executions[0];

  vue.append(h('div', { classe: 'vue-tete' },
    h('div', {}, h('p', { classe: 'meta' }, '03/06 · Rendus d’exécution'), h('h1', { classe: 'grand' }, 'Les exécutions')),
    h('p', { classe: 'doux' }, 'Chaque exécution a sa page avant d’être lancée, se suit en direct pendant qu’elle tourne, puis reçoit ses résultats. Rien n’y figure qui n’ait été mesuré.')));
  if (!x) {
    vue.append(h('div', { classe: 'vide' }, 'Aucune exécution consignée pour l’instant.'));
    return;
  }

  const sommaire = h('nav', { classe: 'exe-liste', 'aria-label': 'Exécutions' }, executions.map((e) =>
    h('article', {
      classe: 'exe-carte', 'aria-current': e.id === x.id ? 'page' : null, 'data-statut': etatDe(e),
      onclick: (evt) => { if (!evt.target.closest('a, button')) location.hash = adresse(e.id); },
    },
      h('span', { classe: 'meta avec-embleme serre' }, embleme('executions', 22), e.id, ' · ', e.date ? dateLongue(e.date) : ''),
      h('a', { classe: 'exe-titre', href: adresse(e.id) }, e.titre),
      avancement(e),
      h('div', { classe: 'exe-pied' }, pilule(etatDe(e)), h('span', { classe: 'exe-boutons' }, boutonPause(e), boutonJournal(e))))));

  const etat = etatDe(x);
  const finie = etat === 'terminee' || etat === 'echouee';
  const piste = pistes.find((p) => p.id === x.piste);
  let n = 0;
  const section = (titre) => h('h3', { classe: 'section-titre' }, h('span', { classe: 'numero' }, ++n), titre);
  const article = h('article', { classe: 'execution' },
    h('div', { classe: 'tiroir-tete' }, embleme('executions', 44), h('span', { classe: 'etiquette' }, x.id),
      h('span', { classe: 'meta' }, x.date ? dateLongue(x.date) : ''), pilule(etat), boutonPause(x), boutonJournal(x)),
    // À droite du titre : le carnet de l'exécution, sa copie à lire façon notebook.
    h('div', { classe: 'fiche-titre-ligne' }, h('h2', { classe: 'fiche-titre' }, x.titre), boutonCarnet(x, codeAnnote)),
    lier(h('p', { classe: 'fiche-resume' }, x.resume)),
    avancement(x),
    h('p', { classe: 'fiche-pistes' },
      piste ? h('a', { classe: 'pilule', href: adresse(piste.id) }, embleme('carte', 15), `${piste.id} · ${piste.titre}`) : null,
      x.taches.map((id) => h('a', { classe: 'pilule', href: adresse(id) }, embleme('taches', 15), `${id} · ${taches.find((t) => t.id === id)?.titre ?? ''}`)),
      h('span', { classe: 'pilule', style: 'text-transform:none' }, x.dossier)),
    finie ? null : h('p', { classe: 'avant-lancement' },
      etat === 'en-cours' || etat === 'en-pause'
        ? 'Cette exécution tourne. La page a été écrite avant le lancement ; les résultats y seront ajoutés à la fin.'
        : 'Cette exécution n’a pas encore été lancée. La page dit ce qu’on sait déjà ; les résultats y seront ajoutés à la fin.'),

    x.bilan.length ? [
      section(finie ? 'Ce que l’exécution a produit' : 'Ce que l’exécution doit produire'),
      h('div', { classe: 'bilan' }, x.bilan.map((b) => h('section', { classe: 'bilan-carte' },
        h('p', { classe: 'meta' }, b.question), h('p', { classe: 'bilan-valeur' }, b.valeur),
        lier(h('div', { classe: 'prose', html: b.detailHtml })), fichesLiees(b.fiches))))] : null,

    x.code.length ? [
      section('Le code utile, et comment le lire'),
      h('p', { classe: 'legende-genres' }, Object.values(GENRES).map((g) => h('span', {}, h('i', { style: `background:${g.couleur}` }), g.nom))),
      x.code.map(codeAnnote)] : null,

    x.sorties.length ? [section('Les sorties'), h('div', { classe: 'sorties' }, x.sorties.map((s) => sortieDe(s, x)))] : null,

    x.limitesHtml ? [
      section(finie ? 'Ce que ça ne dit pas' : 'Ce que ça ne dira pas'),
      lier(h('div', { classe: 'prose limites', html: x.limitesHtml }))] : null,
    x.credits.length ? [
      section('Le travail des autres'),
      h('p', { classe: 'doux', style: 'max-width:78ch;margin-bottom:16px' }, 'Cette exécution s’appuie sur du code et des données que nous n’avons pas écrits. Voici à qui ils sont.'),
      h('ul', { classe: 'liste credits' }, x.credits.map((c) => h('li', {},
        h('div', {}, credit(c.github, c.nom ?? c.github, c.lien ?? `https://github.com/${c.github}`), lier(h('div', { classe: 'prose doux', html: c.quoiHtml })),
          c.personnes.length ? h('ul', { classe: 'personnes' }, c.personnes.map((p) => h('li', {}, credit(p.github, p.nom ? `${p.nom} (${p.github})` : p.github), h('span', { classe: 'doux' }, p.part)))) : null),
        c.licence ? h('span', { classe: 'fin pilule', style: 'text-transform:none' }, c.licence) : null)))] : null,
    h('p', { classe: 'meta', style: 'margin-top:28px;text-transform:none;letter-spacing:0' }, x.fichier));

  vue.append(h('div', { classe: 'exe-vue' }, sommaire, article));
  suivreEnDirect(executions);
}
