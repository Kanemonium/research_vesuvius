// La loupe : parcourir une grande image d'exécution, tuile par tuile, sans la charger en entier.
// Les tuiles sont écrites par scripts/wsl/tuiles.py dans local/apercus/tuiles/<nom>/ (hors dépôt) et
// servies par /apercus/tuiles/<nom>/<variante>/<ligne>_<colonne>.jpg. Molette : zoom autour du
// pointeur ; glisser : déplacer ; double-clic : tout revoir. La position sous le pointeur est donnée
// en pixels de l'image d'origine, pour pouvoir se dire « regarde ligne tant, colonne tant ».
import { h } from './outils.js';

const NOMS = { brut: 'Telle quelle', etale: 'Gris réétalés', zones: 'Zones corrigées' };
const AIDES = {
  brut: 'La prédiction du modèle, sans retouche.',
  etale: 'Aide-vue : le fond mesuré passe au noir, l’encre mesurée au blanc.',
  zones: 'En bleu, là où le modèle a eu le corrigé ; en orange, l’encre étiquetée.',
};
const nb = (v) => Math.round(v).toLocaleString('fr-FR');

export async function ouvrirLoupe(nom, titre) {
  let meta;
  try {
    const r = await fetch(`/apercus/tuiles/${encodeURIComponent(nom)}/meta.json`);
    if (!r.ok) throw new Error();
    meta = await r.json();
  } catch {
    alert('Les tuiles de cette image ne sont pas sur cette machine.');
    return;
  }
  let variante = meta.variantes[0];
  const adresse = (v, l, c) => `/apercus/tuiles/${encodeURIComponent(nom)}/${v}/${l}_${c}.jpg`;
  const tuiles = [];
  const plan = h('div', { classe: 'lp-plan', style: `width:${meta.largeur}px;height:${meta.hauteur}px` });
  for (let l = 0; l < meta.rangees; l++) {
    for (let c = 0; c < meta.colonnes; c++) {
      const img = h('img', { alt: '', loading: 'lazy', draggable: 'false', style: `left:${c * meta.tuile}px;top:${l * meta.tuile}px`, src: adresse(variante, l, c) });
      tuiles.push({ img, l, c });
      plan.append(img);
    }
  }
  const scene = h('div', { classe: 'lp-scene', tabindex: 0, 'aria-label': 'Image à parcourir : molette pour zoomer, glisser pour déplacer' }, plan);
  const position = h('span', { classe: 'meta lp-position' }, '');
  const aide = h('span', { classe: 'lp-aide' }, AIDES[variante]);
  const choix = h('div', { classe: 'dsc-choix lp-choix', role: 'group', 'aria-label': 'Vue' }, meta.variantes.map((v) =>
    h('a', { href: '#', 'aria-pressed': String(v === variante), 'data-variante': v, onclick: (e) => { e.preventDefault(); changer(v); } }, NOMS[v] ?? v)));
  const fenetre = h('dialog', { classe: 'journal-fenetre loupe-fenetre', 'aria-label': `Loupe : ${titre}` },
    h('header', { classe: 'cn-entete' },
      h('h2', { classe: 'cn-titre' }, titre), choix,
      h('button', { classe: 'pilule', type: 'button', onclick: () => cadrer() }, 'Tout voir'),
      h('button', { classe: 'dsc-fermer', type: 'button', 'aria-label': 'Fermer la loupe', onclick: () => fenetre.close() }, '×')),
    scene,
    h('footer', { classe: 'lp-pied' }, aide, position,
      h('span', { classe: 'meta' }, `Image réduite ${meta.reduction} fois · ${nb(meta.largeur_origine)} × ${nb(meta.hauteur_origine)} pixels à l’origine`)));
  document.body.append(fenetre);

  // Vue : décalage (x, y) du plan dans la scène et échelle k.
  const vue = { x: 0, y: 0, k: 1 };
  const appliquer = () => { plan.style.transform = `translate(${vue.x}px, ${vue.y}px) scale(${vue.k})`; };
  function cadrer() {
    const { width: W, height: H } = scene.getBoundingClientRect();
    vue.k = Math.min(W / meta.largeur, H / meta.hauteur);
    vue.x = (W - meta.largeur * vue.k) / 2;
    vue.y = (H - meta.hauteur * vue.k) / 2;
    appliquer();
  }
  function changer(v) {
    variante = v;
    for (const t of tuiles) t.img.src = adresse(v, t.l, t.c);
    for (const a of choix.children) a.setAttribute('aria-pressed', String(a.dataset.variante === v));
    aide.textContent = AIDES[v] ?? '';
  }
  function zoomer(facteur, cx, cy) {
    const k = Math.min(6, Math.max(0.03, vue.k * facteur));
    vue.x = cx - ((cx - vue.x) * k) / vue.k;
    vue.y = cy - ((cy - vue.y) * k) / vue.k;
    vue.k = k;
    appliquer();
  }
  scene.addEventListener('wheel', (e) => {
    e.preventDefault();
    const r = scene.getBoundingClientRect();
    zoomer(e.deltaY > 0 ? 1 / 1.2 : 1.2, e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
  let prise = null;
  scene.addEventListener('pointerdown', (e) => { prise = { x: e.clientX, y: e.clientY, vx: vue.x, vy: vue.y }; scene.setPointerCapture(e.pointerId); scene.classList.add('glisse'); });
  scene.addEventListener('pointermove', (e) => {
    const r = scene.getBoundingClientRect();
    const px = ((e.clientX - r.left - vue.x) / vue.k) * meta.reduction;
    const py = ((e.clientY - r.top - vue.y) / vue.k) * meta.reduction;
    const dedans = px >= 0 && py >= 0 && px < meta.largeur_origine && py < meta.hauteur_origine;
    position.textContent = dedans ? `ligne ${nb(py)} · colonne ${nb(px)} · zoom ${Math.round(vue.k * 100)} %` : `zoom ${Math.round(vue.k * 100)} %`;
    if (!prise) return;
    vue.x = prise.vx + e.clientX - prise.x;
    vue.y = prise.vy + e.clientY - prise.y;
    appliquer();
  });
  const lacher = () => { prise = null; scene.classList.remove('glisse'); };
  scene.addEventListener('pointerup', lacher);
  scene.addEventListener('pointercancel', lacher);
  scene.addEventListener('dblclick', cadrer);
  scene.addEventListener('keydown', (e) => {
    const r = scene.getBoundingClientRect();
    const pas = 80;
    if (e.key === '+' || e.key === '=') zoomer(1.25, r.width / 2, r.height / 2);
    else if (e.key === '-') zoomer(0.8, r.width / 2, r.height / 2);
    else if (e.key === 'ArrowLeft') { vue.x += pas; appliquer(); } else if (e.key === 'ArrowRight') { vue.x -= pas; appliquer(); }
    else if (e.key === 'ArrowUp') { vue.y += pas; appliquer(); } else if (e.key === 'ArrowDown') { vue.y -= pas; appliquer(); }
    else return;
    e.preventDefault();
  });
  fenetre.addEventListener('close', () => fenetre.remove());
  fenetre.showModal();
  cadrer();
  scene.focus();
}
