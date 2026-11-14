// Vue « Horizon » : les problèmes à venir, ce que nous comptons produire pour y répondre, et les prix visés.
// L'épaisseur d'un ruban dit la confiance. Rien ici n'est un résultat : ce sont des projections.
import { LIBELLES, adresse, avecBulle, aujourdhui, dateCourte, dateLongue, h, joursAvant, s, versDate } from '../outils.js';

const EPAISSEUR = { faible: 4, moyenne: 9, forte: 15 };

function confiance(niveau) {
  const n = { faible: 1, moyenne: 2, forte: 3 }[niveau];
  return h('span', { classe: 'confiance', title: `Confiance ${LIBELLES[niveau]}` }, [1, 2, 3].map((i) => h('i', { classe: i <= n ? 'on' : '' })),
    h('span', { classe: 'meta', style: 'margin-left:5px' }, LIBELLES[niveau]));
}

function flux(app, visee) {
  const { problemes, livrables, prix } = app.etat.horizon;
  const boite = h('div', { classe: 'flux' });
  const toile = s('svg', { 'aria-hidden': 'true' });
  const cartes = new Map();
  const liens = []; // { de, vers, livrable }

  const item = (id, ...contenu) => {
    const el = h('a', { classe: 'flux-item', href: adresse(id), id }, contenu);
    cartes.set(id, el);
    return el;
  };
  for (const l of livrables) {
    for (const f of l.repond_a) liens.push({ de: f, vers: l.id, livrable: l });
    for (const p of l.prix) liens.push({ de: l.id, vers: `prix-${p}`, livrable: l });
  }

  boite.append(toile,
    h('div', { classe: 'flux-col' }, h('p', { classe: 'meta' }, 'Problèmes qui nous attendent'),
      problemes.map((f) => item(f.id, h('span', { classe: 'meta' }, f.id), h('b', {}, f.titre), h('small', {}, f.detail)))),
    h('div', { classe: 'flux-col' }, h('p', { classe: 'meta' }, 'Ce que nous comptons produire'),
      livrables.map((l) => item(l.id,
        h('span', { style: 'display:flex;justify-content:space-between;align-items:center;gap:8px' }, h('span', { classe: 'meta' }, `${l.id} · ${dateCourte(l.fenetre)}`), confiance(l.confiance)),
        h('b', {}, l.titre), h('small', {}, l.detail),
        l.hypothese ? h('small', { style: 'margin-top:4px' }, h('em', {}, 'Si : '), l.hypothese) : null))),
    h('div', { classe: 'flux-col' }, h('p', { classe: 'meta' }, 'Prix visés'),
      prix.map((p) => {
        const el = h('div', { classe: 'flux-item', id: `prix-${p.id}` }, h('b', {}, p.titre), h('small', {}, p.montant));
        cartes.set(`prix-${p.id}`, el);
        return el;
      })));

  const tracer = () => {
    const cadre = boite.getBoundingClientRect();
    if (!cadre.width) return;
    toile.setAttribute('viewBox', `0 0 ${cadre.width} ${cadre.height}`);
    toile.replaceChildren(...liens.map((lien) => {
      const a = cartes.get(lien.de).getBoundingClientRect();
      const b = cartes.get(lien.vers).getBoundingClientRect();
      const [x1, y1, x2, y2] = [a.right - cadre.left, a.top + a.height / 2 - cadre.top, b.left - cadre.left, b.top + b.height / 2 - cadre.top];
      const xm = (x1 + x2) / 2;
      return s('path', { classe: 'ruban', 'data-de': lien.de, 'data-vers': lien.vers, 'stroke-width': EPAISSEUR[lien.livrable.confiance],
        d: `M${x1} ${y1} C${xm} ${y1} ${xm} ${y2} ${x2} ${y2}` });
    }));
    if (visee) eclairer(visee);
  };

  // Éclaire un élément et tout ce qui lui est relié, de part et d'autre.
  const eclairer = (id) => {
    const relies = new Set([id]);
    const aGauche = (x) => liens.filter((l) => l.vers === x).forEach((l) => { relies.add(l.de); aGauche(l.de); });
    const aDroite = (x) => liens.filter((l) => l.de === x).forEach((l) => { relies.add(l.vers); aDroite(l.vers); });
    aGauche(id); aDroite(id);
    for (const [cle, el] of cartes) { el.classList.toggle('actif', cle === id); el.classList.toggle('eteint', !relies.has(cle)); }
    for (const ruban of toile.children) {
      const actif = relies.has(ruban.dataset.de) && relies.has(ruban.dataset.vers);
      ruban.classList.toggle('actif', actif); ruban.classList.toggle('eteint', !actif);
    }
  };
  const eteindre = () => {
    if (visee) return eclairer(visee);
    for (const el of cartes.values()) el.classList.remove('actif', 'eteint');
    for (const ruban of toile.children) ruban.classList.remove('actif', 'eteint');
  };
  for (const [id, el] of cartes) {
    el.addEventListener('pointerenter', () => eclairer(id));
    el.addEventListener('pointerleave', eteindre);
    el.addEventListener('focus', () => eclairer(id));
    el.addEventListener('blur', eteindre);
  }
  new ResizeObserver(tracer).observe(boite);
  document.fonts?.ready.then(tracer);
  return boite;
}

function frise(app) {
  const { livrables, echeances, prix, recurrence_mensuelle: recurrence } = app.etat.horizon;
  const debut = aujourdhui();
  const fin = versDate(app.grandPrix);
  const L = 1200; const marge = 30; const y0 = 150;
  const x = (d) => marge + ((versDate(d) - debut) / (fin - debut)) * (L - 2 * marge);
  const svg = s('svg', { viewBox: `0 0 ${L} 215`, role: 'group', 'aria-label': 'Frise des échéances et des livrables projetés' });
  svg.append(s('line', { classe: 'f-axe', x1: marge, y1: y0, x2: L - marge, y2: y0 }));

  // Mois, et fin de mois pour le prix récurrent.
  const titreRecurrent = prix.find((p) => p.id === recurrence)?.titre;
  for (let m = new Date(debut.getFullYear(), debut.getMonth() + 1, 1, 12); m <= fin; m.setMonth(m.getMonth() + 1)) {
    const xm = x(m);
    svg.append(s('line', { classe: 'f-mois', x1: xm, y1: y0, x2: xm, y2: y0 + 9 }),
      s('text', { classe: 'f-texte', x: xm + 5, y: y0 + 24 }, m.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '') + (m.getMonth() === 0 ? ` ${m.getFullYear()}` : '')));
    if (titreRecurrent) {
      const veille = new Date(m); veille.setDate(0);
      const marque = s('rect', { classe: 'f-recur', x: x(veille) - 3, y: y0 - 3, width: 6, height: 6, transform: `rotate(45 ${x(veille)} ${y0})`, tabindex: 0 });
      svg.append(avecBulle(marque, () => [h('div', { classe: 'meta' }, dateLongue(veille)), h('strong', {}, titreRecurrent), 'Échéance mensuelle.']));
    }
  }

  // Aujourd'hui.
  svg.append(s('line', { classe: 'f-auj', x1: marge, y1: y0 - 16, x2: marge, y2: y0 + 16 }),
    s('text', { classe: 'f-auj-texte', x: marge - 4, y: y0 + 42 }, "AUJOURD'HUI"));

  // Livrables : un point au-dessus de l'axe, sur des hauteurs alternées pour ne pas se chevaucher.
  [...livrables].sort((a, b) => String(a.fenetre).localeCompare(String(b.fenetre))).forEach((l, i) => {
    const xl = x(l.fenetre); const haut = y0 - 34 - (i % 3) * 30;
    const point = s('circle', { classe: 'f-point', cx: xl, cy: haut, r: 6, tabindex: 0, role: 'link', 'aria-label': `${l.id}, ${l.titre}, ${dateLongue(l.fenetre)}` });
    point.addEventListener('click', () => { location.hash = adresse(l.id); });
    svg.append(s('line', { classe: 'f-tige', x1: xl, y1: haut + 6, x2: xl, y2: y0 }),
      avecBulle(point, () => [h('div', { classe: 'meta' }, `${l.id} · ${dateLongue(l.fenetre)} · confiance ${LIBELLES[l.confiance]}`), h('strong', {}, l.titre), l.detail]),
      s('text', { classe: 'f-texte', x: xl + 10, y: haut + 4 }, l.id));
  });

  // Échéances fixes : drapeaux noirs.
  for (const e of echeances) {
    const xe = x(e.date); const droite = xe > L * 0.75;
    const texte = `${dateCourte(e.date)} · ${e.titre}`;
    const largeur = texte.length * 7.4 + 18;
    svg.append(s('line', { classe: 'f-axe', x1: xe, y1: y0, x2: xe, y2: 12 }),
      s('rect', { classe: 'f-drapeau', x: droite ? xe - largeur : xe, y: 6, width: largeur, height: 22 }),
      s('text', { classe: 'f-drapeau-texte', x: droite ? xe - largeur + 9 : xe + 9, y: 22 }, texte));
  }
  return h('div', { classe: 'frise' }, svg);
}

export function vueHorizon(vue, app, params) {
  const jours = joursAvant(app.grandPrix);
  vue.append(
    h('div', { classe: 'vue-tete' },
      h('div', {}, h('p', { classe: 'meta' }, '05/05 · Projection'), h('h1', { classe: 'grand' }, "L'horizon")),
      h('p', { classe: 'doux' }, "Des projections, pas des résultats. Les dates et les confiances sont des estimations d'Agent C., révisées à chaque étape. L'épaisseur d'un ruban dit la confiance.")),
    flux(app, params.get('id')),
    h('hr', { classe: 'regle', style: 'margin-top:40px' }),
    h('div', { classe: 'carte-tete' }, h('h2', { classe: 'cond' }, 'La frise'), h('span', { classe: 'meta' }, `${jours} jours jusqu'au ${dateLongue(app.grandPrix)}`)),
    frise(app),
    h('div', { classe: 'legende' },
      h('span', { classe: 'meta' }, '○ livrable projeté'), h('span', { classe: 'meta' }, '◆ fin de mois : prix de progrès'), h('span', { classe: 'meta' }, '▮ échéance fixe')));
}
