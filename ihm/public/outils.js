// Aides partagées par les vues : création de nœuds, dates, libellés, pictos, bulle.
import { embleme } from './emblemes.js';

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
  prevue: 'Prévue',
  ouvert: 'Ouvert', contourne: 'Contourné', corrige: 'Corrigé', terminee: 'Terminée', echouee: 'Échouée',
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

/** Adresse de la vue qui montre un identifiant (P-, D-, T-, X-, K-, L-, F-). */
export function adresse(id) {
  if (/^[PD]-/.test(id)) return `#/carte?id=${id}`;
  if (/^T-/.test(id)) return `#/taches?id=${id}`;
  if (/^X-/.test(id)) return `#/executions?id=${id}`;
  if (/^K-/.test(id)) return `#/doc?id=${id}`;
  return `#/horizon?id=${id}`;
}

// ---------- Crédits : citer l'auteur d'un code qui n'est pas le nôtre
const GITHUB = /^https:\/\/github\.com\/([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))(?:\/|$)/;
/** Compte ou organisation GitHub visé par une adresse, ou null. */
export const compteGithub = (href) => GITHUB.exec(href ?? '')?.[1] ?? null;
/** Photo de profil GitHub d'un compte, en petit rond. Elle disparaît si elle ne se charge pas : le nom reste. */
export function portrait(compte, taille = 18) {
  const img = h('img', { classe: 'portrait', src: `https://github.com/${compte}.png?size=${taille * 3}`, alt: '', width: taille, height: taille, loading: 'lazy', referrerpolicy: 'no-referrer' });
  img.addEventListener('error', () => img.remove());
  return img;
}
/** Lien de crédit : la photo de profil, puis le nom, vers GitHub. */
export const credit = (compte, texte = compte, href = `https://github.com/${compte}`) =>
  h('a', { classe: 'credit', href, target: '_blank', rel: 'noreferrer', title: `${compte} sur GitHub` }, portrait(compte), h('span', {}, texte));
/** Tout lien vers GitHub écrit dans un texte du carnet reçoit la photo de profil de son auteur. */
function decorerCredits(racine) {
  for (const a of racine.querySelectorAll('a[href^="https://github.com/"]')) {
    const compte = compteGithub(a.getAttribute('href'));
    if (!compte || a.classList.contains('credit')) continue;
    a.classList.add('credit');
    a.target = '_blank'; a.rel = 'noreferrer'; a.title = `${compte} sur GitHub`;
    a.prepend(portrait(compte));
  }
}

/** Transforme les identifiants cités dans un texte en liens vers la bonne vue, et signe les liens GitHub. */
export function lier(racine) {
  decorerCredits(racine);
  const marcheur = document.createTreeWalker(racine, NodeFilter.SHOW_TEXT);
  const textes = [];
  while (marcheur.nextNode()) if (!marcheur.currentNode.parentElement.closest('a, code')) textes.push(marcheur.currentNode);
  for (const noeud of textes) {
    const morceaux = noeud.nodeValue.split(/\b([PDTLFKX]-\d{2,3})\b/);
    if (morceaux.length < 2) continue;
    noeud.replaceWith(...morceaux.map((m, i) => (i % 2 ? lienId(m) : m)));
  }
  return racine;
}

export const pilule = (statut, forme = 'rond') => h('span', { classe: 'pilule', 'data-statut': statut }, glyphe(statut, 13, forme), LIBELLES[statut] ?? statut);

/** Le petit signe qui accompagne toujours un statut : la couleur ne porte jamais seule l'information.
 *  Rond pointillé = à faire, orange = en cours, vert coché = validé, croix = impasse ; losange bleu = décision. */
export function glyphe(statut, taille = 14, forme = 'rond') {
  const svg = s('svg', { classe: 'glyphe', width: taille, height: taille, viewBox: '-8 -8 16 16', 'aria-hidden': 'true' });
  const fait = ['validee', 'faite', 'corrige', 'terminee'].includes(statut);
  const bloque = ['impasse', 'bloquee', 'ouvert', 'echouee'].includes(statut);
  const decision = forme === 'losange';
  const couleur = decision ? 'var(--decision)' : fait ? 'var(--valide)' : statut === 'en-cours' ? 'var(--cristal)' : null;
  const communs = {
    fill: fait || statut === 'en-cours' ? couleur : 'none',
    stroke: couleur ?? (bloque ? 'var(--alerte)' : 'currentColor'),
    'stroke-width': 1.5,
    'stroke-dasharray': ['a-explorer', 'a-faire', 'prevue'].includes(statut) ? '2 2.4' : null,
  };
  svg.append(decision ? s('path', { d: 'M0-7 7 0 0 7-7 0Z', ...communs }) : s('circle', { r: 6, ...communs }));
  if (fait) svg.append(s('path', { d: 'M-3 .3l2.1 2.1 3.9-4.6', fill: 'none', stroke: '#fff', 'stroke-width': 1.7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  if (bloque) svg.append(s('path', { d: 'M-2.4-2.4 2.4 2.4M2.4-2.4-2.4 2.4', stroke: 'var(--alerte)', 'stroke-width': 1.4 }));
  return svg;
}

/** Onglet qui montre un identifiant : sert à choisir l'emblème posé devant les liens internes. */
export function ongletDe(id) {
  if (/^[PD]-/.test(id)) return 'carte';
  if (/^T-/.test(id)) return 'taches';
  if (/^X-/.test(id)) return 'executions';
  if (/^K-/.test(id)) return 'doc';
  return 'horizon';
}
/** Lien interne vers un identifiant, précédé de l'emblème de son onglet. */
export const lienId = (id) => h('a', { classe: 'lien-id', href: adresse(id) }, embleme(ongletDe(id), 15), id);

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
