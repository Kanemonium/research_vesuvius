// Suivi du stockage dans la barre du haut : pris, restant, part occupée (ihm/lib/stockage.mjs).
import { avecBulle, h } from './outils.js';

const GO = 1024 ** 3;
const go = (octets) => `${Math.round(octets / GO).toLocaleString('fr-FR')} Go`;
// Seuils d'alerte sur la part occupée : le jeu de données complet du défi ne tient pas dans quelques dizaines de Go.
const niveau = (ratio) => (ratio >= 0.9 ? 'alerte' : ratio >= 0.75 ? 'tendu' : 'calme');

let dernier = null;

async function rafraichir(boite) {
  let st;
  try { st = await (await fetch('/api/stockage')).json(); } catch { return; }
  if (!st?.total) return;
  dernier = st;
  const pourcent = Math.round(st.ratio * 100);
  boite.dataset.niveau = niveau(st.ratio);
  boite.setAttribute('aria-label', `Disque ${st.disque} : ${go(st.pris)} pris, ${go(st.libre)} restants, ${pourcent} % occupés`);
  boite.replaceChildren(
    h('span', { classe: 'stk-chiffres' }, h('b', {}, go(st.pris)), ' pris · ', h('b', {}, go(st.libre)), ' restants'),
    h('span', { classe: 'stk-jauge', 'aria-hidden': 'true' }, h('span', { style: `width:${pourcent}%` })),
    h('span', { classe: 'stk-ratio' }, `${pourcent} %`));
}

export function installerStockage() {
  const boite = document.getElementById('stockage');
  avecBulle(boite, () => (dernier
    ? `Disque ${dernier.disque} · ${go(dernier.total)} au total. Il porte le dépôt et le disque virtuel de WSL.`
    : 'Stockage : mesure indisponible.'));
  rafraichir(boite);
  setInterval(() => { if (!document.hidden) rafraichir(boite); }, 60_000);
}
