// Emblèmes : une famille de pastilles rondes, en aplats francs, pour repérer d'un coup d'œil
// une vue, un domaine ou un type d'objet. Grille 32 × 32, tout tient dans un disque de rayon 15.
// Les couleurs viennent de l'éventail (--ev-*) défini dans styles/tokens.css.
const SVG = 'http://www.w3.org/2000/svg';
const N = 'var(--ev-nuit)'; const B = 'var(--ev-braise)'; const S = 'var(--ev-soleil)'; const C = 'var(--ev-ciel)';
const V = 'var(--ev-violet)'; const P = 'var(--ev-pre)'; const R = 'var(--ev-rose)'; const T = 'var(--ev-turquoise)';
const W = '#fff';

const fond = (c) => `<circle cx="16" cy="16" r="15" fill="${c}"/>`;
const rond = (cx, cy, r, c) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}"/>`;
const forme = (d, c) => `<path d="${d}" fill="${c}"/>`;
const trait = (d, c, w = 3) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

const DESSINS = {
  // ---- Vues ----
  cap: fond(S) + `<circle cx="16" cy="16" r="9.5" fill="none" stroke="${N}" stroke-width="3"/>`
    + forme('M16 8.5 19.2 16H12.8Z', B) + forme('M12.8 16H19.2L16 23.5Z', N),
  carte: fond(N) + trait('M16 16 8.5 9.5M16 16 24.5 12M16 16 20 25', W, 1.8)
    + rond(8.5, 9.5, 3, B) + rond(24.5, 12, 3, C) + rond(20, 25, 3, P) + rond(16, 16, 4, S),
  taches: fond(P) + `<rect x="7.5" y="7.5" width="17" height="17" rx="4" fill="${W}"/>` + trait('M11.6 16.4l3.1 3.1 5.9-7', N, 3),
  github: fond(C) + trait('M11 9v14M11 19c0-5.5 10-2.5 10-8.5', N, 2.8) + rond(11, 8, 3.2, S) + rond(11, 24, 3.2, S) + rond(21, 10, 3.2, B),
  horizon: fond(N) + forme('M8 18a8 8 0 0 1 16 0Z', S) + forme('M1.2 18H30.8A15 15 0 0 1 1.2 18Z', B)
    + trait('M8 23.5h16', V, 2.2) + rond(6, 9, 1.4, C) + rond(25, 7, 1.4, R),
  doc: fond(V) + forme('M6.5 9.5c3.2-1.6 6.3-1.6 9.5 0v14c-3.2-1.6-6.3-1.6-9.5 0Z', W) + forme('M16 9.5c3.2-1.6 6.3-1.6 9.5 0v14c-3.2-1.6-6.3-1.6-9.5 0Z', '#E9DDFB')
    + trait('M9 13.2c1.6-.6 3.2-.6 4.6 0M9 16.6c1.6-.6 3.2-.6 4.6 0', N, 1.5) + forme('M19.2 8.6h3.4v7.2l-1.7-1.6-1.7 1.6Z', S),

  // ---- Domaines ----
  defi: fond(N) + forme('M4.6 24 12.6 11.5h6.8L27.4 24Z', B) + forme('M12.6 11.5h6.8l-1.6 3.4-1.8-1.4-1.8 1.4Z', S)
    + rond(20.5, 6.2, 1.9, S) + rond(15.5, 4.8, 1.3, R),
  scan: fond(C) + rond(16, 16, 10, N) + rond(16, 16, 6, S) + forme('M16 16 29.4 9.2A15 15 0 0 1 29.4 22.8Z', V) + rond(16, 16, 2.4, B),
  depliage: fond(S) + trait('M14 14.5a2 2 0 0 1 4 0a4 4 0 0 1-8 0a6 6 0 0 1 12 0', N, 2.6)
    + `<rect x="6.5" y="22.6" width="19" height="3.6" rx="1.8" fill="${B}"/>` + rond(22, 14.5, 1.9, V),
  encre: fond(N) + forme('M16 4.5C16 4.5 8.5 13.3 8.5 18.6a7.5 7.5 0 0 0 15 0C23.5 13.3 16 4.5 16 4.5Z', B)
    + rond(13.2, 19.2, 2.1, S) + rond(24, 8.5, 1.7, C),
  outils: fond(T) + forme('M16 6 26 16 16 26 6 16Z', N) + rond(16, 16, 4.2, S)
    + rond(16, 3.6, 1.7, B) + rond(28.4, 16, 1.7, B) + rond(16, 28.4, 1.7, B) + rond(3.6, 16, 1.7, B),
  pilotage: fond(V) + rond(16, 16, 10.5, S) + rond(16, 16, 6.5, N) + rond(16, 16, 2.8, B),

  // ---- Objets ----
  boite: fond(R) + forme('M7 9.5h18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H16l-5 4v-4H7a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z', N)
    + rond(11.5, 15.5, 1.6, S) + rond(16, 15.5, 1.6, W) + rond(20.5, 15.5, 1.6, C),
  mouvement: fond(C) + trait('M4.5 17h5l3-7.5 5 13.5 3-6h7', N, 2.8) + rond(12.5, 9.5, 1.8, S),
  probleme: fond(S) + forme('M16 6.5 26 23.5H6Z', N) + `<rect x="14.7" y="12" width="2.6" height="6" rx="1.3" fill="${S}"/>` + rond(16, 20.6, 1.5, B),
  livrable: fond(P) + `<rect x="8" y="9" width="16" height="15" rx="2.6" fill="${W}"/>` + `<rect x="14.4" y="9" width="3.2" height="15" fill="${B}"/>`
    + `<rect x="8" y="14.9" width="16" height="3.2" fill="${S}"/>`,
  prix: fond(B) + forme('M10.6 4.6h4.2l2 7.4h-3.4Z', N) + forme('M21.4 4.6h-4.2l-2 7.4h3.4Z', V) + rond(16, 19, 7, S) + rond(16, 19, 3, W),
};

function creer(nom, taille, attrs = {}) {
  const svg = document.createElementNS(SVG, 'svg');
  for (const [k, v] of Object.entries({ class: 'embleme', width: taille, height: taille, viewBox: '0 0 32 32', 'aria-hidden': 'true', ...attrs })) svg.setAttribute(k, v);
  svg.innerHTML = DESSINS[nom] ?? DESSINS.defi;
  return svg;
}

/** Emblème pour une page HTML. */
export const embleme = (nom, taille = 28) => creer(nom, taille);
/** Emblème centré en (x, y) à l'intérieur d'un autre SVG. */
export const emblemeDans = (nom, x, y, taille) => creer(nom, taille, { x: x - taille / 2, y: y - taille / 2, style: 'pointer-events:none' });
export const NOMS_EMBLEMES = Object.keys(DESSINS);
