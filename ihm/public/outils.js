// Aides partagées par les vues : création de nœuds, dates, libellés, pictos, bulle.
const SVG = 'http://www.w3.org/2000/svg';

function poser(el, attrs, enfants) {
  for (const [k, v] of Object.entries(attrs ?? {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else el.setAttribute(k === 'classe' ? 'class' : k, v === true ? '' : v);
  }
  for (const e of enfants.flat(Infinity)) {
    if (e === null || e === undefined || e === false) continue;
    el.append(e instanceof Node ? e : document.createTextNode(String(e)));
  }
  return el;
}
/** Élément HTML : h('p', {classe: 'meta'}, 'texte', autreNoeud). */
export const h = (balise, attrs, ...enfants) => poser(document.createElement(balise), attrs, enfants);
/** Élément SVG. */
export const s = (balise, attrs, ...enfants) => poser(document.createElementNS(SVG, balise), attrs, enfants);

export const LIBELLES = {
  'a-explorer': 'À explorer', 'en-cours': 'En cours', validee: 'Validée', impasse: 'Impasse',
  'a-faire': 'À faire', bloquee: 'Bloquée', faite: 'Faite',
  racine: 'Défi', domaine: 'Domaine', piste: 'Piste', decision: 'Décision',
  faible: 'faible', moyenne: 'moyenne', forte: 'forte',
};

const JOUR = 86_400_000;
const versDate = (d) => (d instanceof Date ? d : new Date(/^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d}T12:00:00` : d));
export const aujourdhui = () => { const d = new Date(); d.setHours(12, 0, 0, 0); return d; };
export const joursAvant = (d) => Math.round((versDate(d) - aujourdhui()) / JOUR);
export const dateCourte = (d) => versDate(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
export const dateLongue = (d) => versDate(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
export function ilYA(d) {
  const min = Math.round((Date.now() - versDate(d)) / 60_000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  if (min < 1440) return `il y a ${Math.round(min / 60)} h`;
  return `il y a ${Math.round(min / 1440)} j`;
}
export { versDate };

/** Adresse de la vue qui montre un identifiant (P-, D-, T-, L-, F-). */
export function adresse(id) {
  if (/^[PD]-/.test(id)) return `#/carte?id=${id}`;
  if (/^T-/.test(id)) return `#/taches?id=${id}`;
  return `#/horizon?id=${id}`;
}

/** Transforme les identifiants cités dans un texte en liens vers la bonne vue. */
export function lier(racine) {
  const marcheur = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT);
  const textes = [];
  while (marcheur.nextNode()) if (!marcheur.currentNode.parentElement.closest('a, code')) textes.push(marcheur.currentNode);
  for (const noeud of textes) {
    const morceaux = noeud.nodeValue.split(/\b([PDTLF]-\d{2,3})\b/);
    if (morceaux.length < 2) continue;
    noeud.replaceWith(...morceaux.map((m, i) => (i % 2 ? h('a', { classe: 'lien-id', href: adresse(m) }, m) : m)));
  }
  return racine;
}

export const pilule = (statut) => h('span', { classe: 'pilule', 'data-statut': statut }, glyphe(statut, 10), LIBELLES[statut] ?? statut);

/** Le petit signe qui accompagne toujours un statut : la couleur ne porte jamais seule l'information. */
export function glyphe(statut, taille = 14, forme = 'rond') {
  const r = 4.6;
  const svg = s('svg', { classe: 'glyphe', width: taille, height: taille, viewBox: '-8 -8 16 16', 'aria-hidden': 'true' });
  const plein = { 'en-cours': 'var(--cristal)', validee: 'currentColor', faite: 'currentColor' }[statut] ?? 'none';
  const trait = { 'en-cours': 'var(--cristal-fonce)', impasse: 'var(--alerte)', bloquee: 'var(--alerte)' }[statut] ?? 'currentColor';
  const pointille = statut === 'a-explorer' || statut === 'a-faire' ? '2 2.4' : null;
  const communs = { fill: plein, stroke: trait, 'stroke-width': 1.5, 'stroke-dasharray': pointille };
  svg.append(forme === 'losange'
    ? s('rect', { x: -r, y: -r, width: 2 * r, height: 2 * r, transform: 'rotate(45)', ...communs })
    : s('circle', { r, ...communs }));
  if (statut === 'impasse' || statut === 'bloquee') svg.append(s('path', { d: 'M-2.4-2.4 2.4 2.4M2.4-2.4-2.4 2.4', stroke: 'var(--alerte)', 'stroke-width': 1.4 }));
  return svg;
}

// Pictos de navigation — palier « picto » du système Épure : 24×24, trait 1,3, au moins une forme fermée (.s).
const picto = (label, corps) => `<svg class="ep-picto" width="20" height="20" viewBox="0 0 24 24" role="img" aria-label="${label}">${corps}</svg>`;
const f = (c, d) => `<path class="s" style="--c:${c}" stroke="${c}" fill="none" d="${d}"/>`;
const l = (c, d) => `<path class="l" style="--c:${c}" stroke="${c}" fill="none" d="${d}"/>`;
const rond = (c, cx, cy, r) => `<circle class="s" style="--c:${c}" stroke="${c}" fill="none" cx="${cx}" cy="${cy}" r="${r}"/>`;
export const PICTOS = {
  cap: picto('Cap', rond('#928982', 12, 12, 8.6) + f('#E17350', 'M14.9 9.1 13.3 13.3 9.1 14.9 10.7 10.7Z')),
  carte: picto('Carte', rond('#72A2B9', 12, 12, 2.6) + rond('#CCAE65', 5, 6, 1.9) + rond('#60C711', 19.2, 8, 1.9) + rond('#D4A5CA', 16.5, 19, 1.9)
    + l('#928982', 'M10 10.3 6.4 7.3M14.4 10.9 17.5 8.8M13.2 14.3 15.6 17.3')),
  taches: picto('Tâches', f('#8B8468', 'M4 5.5h5v5H4Z') + f('#E17350', 'M4 13.5h5v5H4Z') + l('#928982', 'M12.5 8h7.5M12.5 16h7.5') + l('#8B8468', 'M5.3 8l1 1 1.6-2')),
  github: picto('GitHub', rond('#72A2B9', 7, 5.6, 2.2) + rond('#72A2B9', 7, 18.4, 2.2) + rond('#D4A5CA', 17, 9.2, 2.2) + l('#928982', 'M7 7.8v8.4M17 11.4c0 3.4-4.2 3.2-8.2 5.2')),
  horizon: picto('Horizon', f('#CCAE65', 'M6.5 15.5a5.5 5.5 0 0 1 11 0Z') + l('#928982', 'M3 15.5h18M12 6.6V4.4M5.9 9.2 4.4 7.7M18.1 9.2l1.5-1.5M7 19h10')),
};

// Bulle d'information, commune à toutes les vues.
const bulle = () => document.getElementById('bulle');
export function montrerBulle(evt, ...contenu) {
  const b = bulle();
  b.replaceChildren(...contenu.flat());
  b.hidden = false;
  placerBulle(evt);
}
export function placerBulle(evt) {
  const b = bulle();
  if (b.hidden) return;
  const cible = evt.clientX === undefined ? evt.target.getBoundingClientRect() : null;
  const x = cible ? cible.right : evt.clientX;
  const y = cible ? cible.top : evt.clientY;
  const { width, height } = b.getBoundingClientRect();
  b.style.left = `${Math.max(8, Math.min(x + 16, innerWidth - width - 8))}px`;
  b.style.top = `${Math.max(8, Math.min(y + 16, innerHeight - height - 8))}px`;
}
export const cacherBulle = () => { bulle().hidden = true; };
/** Branche survol et focus clavier d'un élément sur la bulle. */
export function avecBulle(el, contenu) {
  const ouvrir = (e) => montrerBulle(e, contenu());
  el.addEventListener('pointerenter', ouvrir);
  el.addEventListener('pointermove', placerBulle);
  el.addEventListener('pointerleave', cacherBulle);
  el.addEventListener('focus', ouvrir);
  el.addEventListener('blur', cacherBulle);
  return el;
}

export const resume = (texte, n = 190) => {
  const brut = (texte ?? '').replace(/[*_`>#-]/g, '').replace(/\s+/g, ' ').trim();
  return brut.length > n ? `${brut.slice(0, n).replace(/\s\S*$/, '')}…` : brut;
};

export async function envoyer(methode, chemin, corps) {
  const r = await fetch(chemin, { method: methode, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corps) });
  const reponse = await r.json();
  if (!r.ok) throw new Error(reponse.erreur ?? `erreur ${r.status}`);
  return reponse;
}
