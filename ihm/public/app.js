// Point d'entrée : état, navigation par ancre (#/vue?id=…), thème.
import { PICTOS, cacherBulle, dateLongue, h, joursAvant } from './outils.js';
import { vueCap } from './vues/cap.js';
import { vueCarte } from './vues/carte.js';
import { vueGithub } from './vues/github.js';
import { vueHorizon } from './vues/horizon.js';
import { vueTaches } from './vues/taches.js';

const VUES = {
  cap: { titre: 'Cap', rendre: vueCap },
  carte: { titre: 'Carte', rendre: vueCarte },
  taches: { titre: 'Tâches', rendre: vueTaches },
  github: { titre: 'GitHub', rendre: vueGithub },
  horizon: { titre: 'Horizon', rendre: vueHorizon },
};
const GRAND_PRIX = '2027-06-25';

const app = {
  etat: null,
  /** Recharge le carnet depuis le disque puis redessine la vue courante. */
  async recharger() {
    app.etat = await (await fetch('/api/etat')).json();
    rendre();
  },
  github: () => fetch('/api/github').then((r) => r.json()),
  grandPrix: GRAND_PRIX,
};

function route() {
  const m = /^#\/(\w+)(?:\?(.*))?$/.exec(location.hash);
  const nom = m && VUES[m[1]] ? m[1] : 'cap';
  return { nom, params: new URLSearchParams(m?.[2] ?? '') };
}

function rendre() {
  const { nom, params } = route();
  cacherBulle();
  document.getElementById('nav').replaceChildren(...Object.entries(VUES).map(([cle, v], i) =>
    h('a', { href: `#/${cle}`, 'aria-current': cle === nom ? 'page' : null, html: PICTOS[cle] }, h('span', {}, v.titre),
      h('span', { classe: 'mono', style: 'opacity:.55;font-size:.7em' }, `0${i + 1}`))));
  document.title = `${VUES[nom].titre} — Agent C.`;
  const vue = document.getElementById('vue');
  vue.replaceChildren();
  if (app.etat.erreurs.length) {
    vue.append(h('div', { classe: 'bandeau', role: 'alert' },
      h('strong', {}, `Le carnet contient ${app.etat.erreurs.length} incohérence(s). `), app.etat.erreurs.join(' · ')));
  }
  VUES[nom].rendre(vue, app, params);
}

function horloge() {
  document.getElementById('horloge').textContent = `${dateLongue(new Date())} · J-${joursAvant(GRAND_PRIX)}`;
}

const bouton = document.getElementById('theme');
function libelleTheme() {
  bouton.textContent = document.documentElement.dataset.theme === 'carbone' ? 'Papier' : 'Carbone';
}
bouton.addEventListener('click', () => {
  const suivant = document.documentElement.dataset.theme === 'carbone' ? '' : 'carbone';
  if (suivant) document.documentElement.dataset.theme = suivant;
  else delete document.documentElement.dataset.theme;
  try { localStorage.setItem('theme', suivant); } catch { /* stockage indisponible : le thème vaut pour la page */ }
  libelleTheme();
  rendre();
});

addEventListener('hashchange', rendre);
libelleTheme();
horloge();
app.recharger().catch((e) => {
  document.getElementById('vue').replaceChildren(h('div', { classe: 'bandeau', role: 'alert' }, `Impossible de lire le carnet : ${e.message}`));
});
