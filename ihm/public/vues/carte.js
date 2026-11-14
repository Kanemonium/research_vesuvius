// Vue « Carte » : la cartographie radiale des chemins empruntés.
// Le secteur (bande noire) dit le domaine ; le signe du nœud dit le statut. L'orange désigne ce qui est en cours.
import { embleme, emblemeDans } from '../emblemes.js';
import { LIBELLES, adresse, avecBulle, dateLongue, envoyer, glyphe, h, lier, pilule, resume, s } from '../outils.js';

const BANDE = 138;
const ANNEAUX = [0, 0, 232, 300, 360];
const TAU = Math.PI * 2;
const polaire = (r, a) => [r * Math.cos(a), r * Math.sin(a)];
const pt = (r, a) => polaire(r, a).map((v) => v.toFixed(1)).join(' ');

/** Donne à chaque piste un angle propre : un créneau par nœud, regroupés par domaine. */
function disposer(pistes) {
  const enfants = new Map(pistes.map((p) => [p.id, []]));
  for (const p of pistes) if (p.parent) enfants.get(p.parent)?.push(p);
  for (const liste of enfants.values()) liste.sort((a, b) => (a.type === 'decision') - (b.type === 'decision') || a.id.localeCompare(b.id));
  const racine = pistes.find((p) => p.type === 'racine');
  const domaines = enfants.get(racine.id);

  const groupes = domaines.map((d) => {
    const noeuds = [];
    (function descendre(parent, profondeur) {
      for (const e of enfants.get(parent.id)) { noeuds.push({ piste: e, parent, profondeur }); descendre(e, profondeur + 1); }
    })(d, 2);
    return { domaine: d, noeuds, largeur: Math.max(2, noeuds.length) };
  });
  const ecart = 0.55;
  const pas = TAU / groupes.reduce((n, g) => n + g.largeur + ecart, 0);
  let curseur = -Math.PI / 2 + (ecart * pas) / 2;
  const angles = new Map();
  for (const g of groupes) {
    g.debut = curseur; g.fin = curseur + g.largeur * pas; g.milieu = (g.debut + g.fin) / 2;
    const marge = (g.largeur - g.noeuds.length) / 2;
    g.noeuds.forEach((n, i) => { n.angle = g.debut + (marge + i + 0.5) * pas; angles.set(n.piste.id, n); });
    angles.set(g.domaine.id, { piste: g.domaine, angle: g.milieu, profondeur: 1 });
    curseur = g.fin + ecart * pas;
  }
  const fond = Math.max(2, ...groupes.flatMap((g) => g.noeuds.map((n) => Math.min(n.profondeur, ANNEAUX.length - 1))));
  const bord = ANNEAUX[fond] + 46;
  return { racine, groupes, angles, R: { bande: BANDE, anneaux: ANNEAUX.slice(0, fond + 1), bord, cadre: bord + 226 } };
}

function couper(titre, max = 21) {
  if (titre.length <= max) return [titre];
  const mots = titre.split(' ');
  const lignes = [''];
  for (const mot of mots) {
    const derniere = lignes[lignes.length - 1];
    if (derniere && (derniere + mot).length + 1 > max && lignes.length < 2) lignes.push(mot);
    else lignes[lignes.length - 1] = derniere ? `${derniere} ${mot}` : mot;
  }
  if (lignes[1]?.length > max + 4) lignes[1] = `${lignes[1].slice(0, max + 2).trimEnd()}…`;
  return lignes;
}

function contenuBulle(p, app) {
  const cause = p.sections.find((x) => x.titre === 'Cause racine') ?? p.sections.find((x) => x.titre === 'Constat');
  const n = app.etat.taches.filter((t) => t.piste === p.id && t.statut !== 'faite').length;
  return [
    h('div', { classe: 'meta' }, `${p.id} · ${LIBELLES[p.type]} · ${LIBELLES[p.statut]}`),
    h('strong', {}, p.titre),
    cause ? h('div', {}, h('em', {}, `${cause.titre} — `), resume(cause.md)) : null,
    h('div', { classe: 'meta', style: 'margin-top:6px' }, `${n} tâche${n > 1 ? 's' : ''} ouverte${n > 1 ? 's' : ''} · cliquer pour ouvrir`),
  ];
}

function dessiner(app, choisie) {
  const { pistes } = app.etat;
  const { racine, groupes, angles, R } = disposer(pistes);
  const c = R.cadre;
  const svg = s('svg', { viewBox: `${-c} ${-c} ${2 * c} ${2 * c}`, role: 'group', 'aria-label': 'Carte des pistes, disposées en cercle par domaine' });
  const defs = s('defs');
  const fond = s('g');
  const liens = s('g');
  const noeuds = s('g');
  svg.append(defs, fond, liens, noeuds);

  for (const r of R.anneaux.slice(2)) fond.append(s('circle', { classe: 'c-anneau', r }));
  fond.append(s('circle', { classe: 'c-anneau', r: R.bord - 14, 'stroke-dasharray': '2 5' }));

  const aller = (id) => { location.hash = `#/carte?id=${id}`; };
  const bouton = (g, p) => {
    g.setAttribute('tabindex', '0');
    g.setAttribute('role', 'button');
    g.setAttribute('aria-label', `${p.id}, ${p.titre}, ${LIBELLES[p.statut]}`);
    g.setAttribute('aria-pressed', String(p.id === choisie));
    g.addEventListener('click', () => aller(p.id));
    g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); aller(p.id); } });
    return avecBulle(g, () => contenuBulle(p, app));
  };

  // Domaines : une bande d'encre par secteur, le nom écrit dessus.
  for (const g of groupes) {
    const bas = Math.sin(g.milieu) > 0.05; // moitié basse : on inverse l'arc pour que le texte reste à l'endroit
    const [a0, a1] = bas ? [g.fin, g.debut] : [g.debut, g.fin];
    const d = `M${pt(R.bande, a0)} A${R.bande} ${R.bande} 0 0 ${bas ? 0 : 1} ${pt(R.bande, a1)}`;
    const id = `arc-${g.domaine.id}`;
    defs.append(s('path', { id, d }));
    const groupe = bouton(s('g', { classe: 'c-noeud c-domaine', 'data-statut': g.domaine.statut }), g.domaine);
    groupe.append(s('path', { classe: 'c-bande', d }),
      s('text', { classe: 'c-bande-texte', dy: 8 }, s('textPath', { href: `#${id}`, startOffset: '50%', 'text-anchor': 'middle' }, g.domaine.titre)));
    noeuds.append(groupe, emblemeDans(g.domaine.domaine, ...polaire(97, g.milieu), 30));

    for (const n of g.noeuds) {
      const p = n.piste;
      const r = ANNEAUX[Math.min(n.profondeur, ANNEAUX.length - 1)];
      const [x, y] = polaire(r, n.angle);
      // Lien courbe depuis le parent (la bande du domaine, ou le nœud parent).
      const parent = angles.get(n.parent.id);
      const rp = parent.profondeur === 1 ? R.bande + 20 : ANNEAUX[Math.min(parent.profondeur, ANNEAUX.length - 1)];
      const rm = (rp + r) / 2;
      liens.append(s('path', { classe: 'c-lien', 'data-statut': p.statut,
        d: `M${pt(rp, parent.angle)} C${pt(rm, parent.angle)} ${pt(rm, n.angle)} ${pt(r, n.angle)}` }));
      liens.append(s('line', { classe: 'c-rappel', x1: polaire(r + 14, n.angle)[0], y1: polaire(r + 14, n.angle)[1], x2: polaire(R.bord - 8, n.angle)[0], y2: polaire(R.bord - 8, n.angle)[1] }));

      const groupeNoeud = bouton(s('g', { classe: 'c-noeud', 'data-statut': p.statut }), p);
      const rayon = p.statut === 'en-cours' ? 9 : 7;
      groupeNoeud.append(s('circle', { classe: 'cible', cx: x, cy: y, r: 20 }));
      if (p.statut === 'en-cours') groupeNoeud.append(s('circle', { classe: 'halo', cx: x, cy: y, r: 16 }));
      groupeNoeud.append(p.type === 'decision'
        ? s('path', { classe: 'forme', d: `M${x} ${y - rayon * 1.35}L${x + rayon * 1.35} ${y}L${x} ${y + rayon * 1.35}L${x - rayon * 1.35} ${y}Z` })
        : s('circle', { classe: 'forme', cx: x, cy: y, r: rayon }));
      if (p.statut === 'impasse') groupeNoeud.append(s('path', { classe: 'croix', d: `M${x - 4} ${y - 4}l8 8M${x + 4} ${y - 4}l-8 8` }));

      // Libellé sur le pourtour, tourné le long du rayon, toujours lisible de gauche à droite.
      const deg = (n.angle * 180) / Math.PI;
      const gauche = Math.cos(n.angle) < 0;
      const [lx, ly] = polaire(R.bord, n.angle);
      const lignes = couper(p.titre);
      const texte = s('text', { transform: `translate(${lx.toFixed(1)} ${ly.toFixed(1)}) rotate(${(gauche ? deg + 180 : deg).toFixed(1)})`, 'text-anchor': gauche ? 'end' : 'start' });
      lignes.forEach((ligne, i) => texte.append(s('tspan', { x: 0, dy: i === 0 ? (lignes.length === 1 ? 7 : -5) : 23 }, ligne)));
      groupeNoeud.append(texte);
      noeuds.append(groupeNoeud);
    }
  }

  // Centre : le défi.
  const centre = bouton(s('g', { classe: 'c-centre' }), racine);
  centre.append(s('circle', { r: 76 }), emblemeDans('defi', 0, -42, 30),
    s('text', { classe: 'c-centre-titre', y: -2, 'text-anchor': 'middle' }, 'Lire les'),
    s('text', { classe: 'c-centre-titre', y: 21, 'text-anchor': 'middle' }, 'rouleaux'),
    s('text', { classe: 'c-centre-meta', y: 44, 'text-anchor': 'middle' }, `${pistes.length - 1} nœuds`));
  noeuds.append(centre);
  return svg;
}

function arbre(app, choisie) {
  const { pistes } = app.etat;
  const enfants = (id) => pistes.filter((p) => p.parent === id).sort((a, b) => a.id.localeCompare(b.id));
  const branche = (p) => h('li', {},
    h('a', { href: adresse(p.id), 'aria-current': p.id === choisie ? 'true' : null },
      glyphe(p.statut, 14, p.type === 'decision' ? 'losange' : 'rond'),
      p.type === 'domaine' || p.type === 'racine' ? embleme(p.domaine, 24) : null, h('span', { classe: 'mono doux' }, p.id),
      h('span', { classe: 't', style: p.type === 'domaine' || p.type === 'racine' ? 'font-weight:600' : '' }, p.titre),
      h('span', { classe: 'meta', style: 'margin-left:auto' }, LIBELLES[p.statut])),
    enfants(p.id).length ? h('ul', {}, enfants(p.id).map(branche)) : null);
  return h('ul', { classe: 'arbre carte' }, branche(pistes.find((p) => p.type === 'racine')));
}

function tiroir(app, p) {
  if (!p) {
    return h('aside', { classe: 'carte tiroir' }, h('p', { classe: 'meta' }, 'Lecture'),
      h('h2', { classe: 'titre' }, 'Choisissez un nœud'),
      h('p', { classe: 'doux' }, 'Survolez la carte pour un aperçu. Cliquez sur un nœud pour lire le constat, la cause racine et nos réflexions, et pour voir les tâches qui y sont liées.'));
  }
  const { taches, horizon } = app.etat;
  const liees = taches.filter((t) => t.piste === p.id);
  const livrables = horizon.livrables.filter((l) => l.piste === p.id);
  const fiches = app.etat.fiches.filter((f) => f.pistes.includes(p.id));
  const prix = p.prix.map((id) => horizon.prix.find((x) => x.id === id)).filter(Boolean);
  const note = h('textarea', { classe: 'champ', rows: 2, placeholder: `Une réflexion sur ${p.id}…`, 'aria-label': `Note pour Agent C. sur ${p.id}` });
  const retour = h('span', { classe: 'meta', role: 'status' });

  return h('aside', { classe: 'carte tiroir', 'aria-live': 'polite' },
    h('div', { classe: 'tiroir-tete' }, embleme(p.domaine, 38), h('span', { classe: 'etiquette' }, p.id), pilule(p.statut), h('span', { classe: 'meta' }, LIBELLES[p.type])),
    h('h2', { classe: 'titre' }, p.titre),
    h('p', { classe: 'meta' }, `${p.domaine} · ${dateLongue(p.date)}`, p.source ? [' · ', h('a', { href: p.source, target: '_blank', rel: 'noreferrer' }, 'source ↗')] : null),
    prix.length ? h('p', { style: 'margin-top:8px' }, prix.map((x) => h('a', { classe: 'pilule', href: '#/horizon', style: 'margin-right:6px' }, x.titre))) : null,
    p.sections.map((sec) => [h('h3', {}, sec.titre), lier(h('div', { classe: 'prose', html: sec.html }))]),
    h('h3', {}, `Tâches liées (${liees.length})`),
    liees.length ? h('ul', { classe: 'liste' }, liees.map((t) => h('li', {}, glyphe(t.statut),
      h('a', { href: adresse(t.id) }, h('span', { classe: 'mono' }, t.id), ' ', t.titre)))) : h('p', { classe: 'doux' }, 'Aucune.'),
    livrables.length ? [h('h3', {}, 'Livrables projetés'), h('ul', { classe: 'liste' }, livrables.map((l) => h('li', {},
      h('a', { href: adresse(l.id) }, h('span', { classe: 'mono' }, l.id), ' ', l.titre))))] : null,
    fiches.length ? [h('h3', {}, 'Pour comprendre'), h('ul', { classe: 'liste' }, fiches.map((f) => h('li', {}, embleme('doc', 22),
      h('a', { href: adresse(f.id) }, h('span', { classe: 'mono' }, f.id), ' ', f.fr.titre))))] : null,
    h('h3', {}, 'Annoter'),
    h('form', { onsubmit: async (e) => {
      e.preventDefault();
      try {
        await envoyer('POST', '/api/boite', { texte: `[${p.id}] ${note.value}` });
        note.value = '';
        retour.textContent = "Déposé dans la boîte d'Agent C.";
      } catch (err) { retour.textContent = err.message; }
    } }, note, h('div', { style: 'display:flex;gap:12px;align-items:center;margin-top:8px' },
      h('button', { classe: 'bouton mini', type: 'submit' }, 'Envoyer à Agent C.'), retour)),
    h('p', { classe: 'meta', style: 'margin-top:20px;text-transform:none;letter-spacing:0' }, p.fichier));
}

export function vueCarte(vue, app, params) {
  const { pistes } = app.etat;
  const choisie = params.get('id');
  const mode = params.get('mode') === 'liste' ? 'liste' : 'carte';
  const lien = (m) => `#/carte?${new URLSearchParams({ ...(choisie ? { id: choisie } : {}), ...(m === 'liste' ? { mode: 'liste' } : {}) })}`;
  const legende = (statut, texte, forme) => h('span', { classe: 'meta' }, glyphe(statut, 14, forme), texte);

  vue.append(
    h('div', { classe: 'vue-tete' },
      h('div', {}, h('p', { classe: 'meta' }, '02/06 · Cartographie'), h('h1', { classe: 'grand' }, 'Les chemins')),
      h('div', { style: 'display:flex;gap:8px' },
        h('a', { classe: `bouton mini ${mode === 'carte' ? '' : 'discret'}`, href: lien('carte') }, 'Carte'),
        h('a', { classe: `bouton mini ${mode === 'liste' ? '' : 'discret'}`, href: lien('liste') }, 'Liste'))),
    h('div', { classe: 'carte-vue' },
      h('div', { classe: 'carte-toile' },
        mode === 'carte' ? dessiner(app, choisie) : arbre(app, choisie),
        h('div', { classe: 'legende' },
          legende('a-explorer', 'À explorer'), legende('en-cours', 'En cours'), legende('validee', 'Validée'),
          legende('impasse', 'Impasse'), legende('validee', 'Décision', 'losange'))),
      tiroir(app, pistes.find((p) => p.id === choisie))));
}
