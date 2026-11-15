// Point d'entrée : état, navigation par ancre (#/vue?id=…), thème.
import { installerDiscord } from './discord.js';
import { embleme } from './emblemes.js';
import { cacherBulle, dateLongue, h, joursAvant } from './outils.js';
import { vueCap } from './vues/cap.js';
import { vueCarte } from './vues/carte.js';
import { vueDoc } from './vues/doc.js';
import { vueExecutions } from './vues/executions.js';
import { vueGithub } from './vues/github.js';
import { vueHorizon } from './vues/horizon.js';
import { vueTaches } from './vues/taches.js';

// L'accueil (« cap ») n'est pas un onglet : on y revient par le logo, en haut à gauche.
const ACCUEIL = 'cap';
const VUES = {
  cap: { titre: 'Accueil', rendre: vueCap },
  carte: { titre: 'Carte', rendre: vueCarte },
  taches: { titre: 'Tâches', rendre: vueTaches },
  executions: { titre: 'Exécutions', rendre: vueExecutions },
  github: { titre: 'GitHub', rendre: vueGithub },
  horizon: { titre: 'Horizon', rendre: vueHorizon },
  doc: { titre: 'Doc', rendre: vueDoc },
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
  /** Langue des fiches de documentation : 'fr' ou 'en'. */
  langue() {
    try { return localStorage.getItem('langue') === 'en' ? 'en' : 'fr'; } catch { return app.langueCourante ?? 'fr'; }
  },
  choisirLangue(code) {
    app.langueCourante = code;
    try { localStorage.setItem('langue', code); } catch { /* stockage indisponible : le choix vaut pour la page */ }
    rendre();
  },
};

function route() {
  const m = /^#\/(\w+)(?:\?(.*))?$/.exec(location.hash);
  const nom = m && VUES[m[1]] ? m[1] : ACCUEIL;
  return { nom, params: new URLSearchParams(m?.[2] ?? '') };
}

function rendre() {
  const { nom, params } = route();
  cacherBulle();
  document.getElementById('nav').replaceChildren(...Object.entries(VUES).filter(([cle]) => cle !== ACCUEIL).map(([cle, v], i) =>
    h('a', { href: `#/${cle}`, 'aria-current': cle === nom ? 'page' : null }, embleme(cle, 34), h('span', {}, v.titre),
      h('span', { classe: 'mono', style: 'opacity:.55;font-size:.7em' }, `0${i + 1}`))));
  document.querySelector('.marque').setAttribute('aria-current', nom === ACCUEIL ? 'page' : 'false');
  document.title = `${VUES[nom].titre} — Hephaist'OS`;
  // Certaines vues s'animent seulement quand on y était déjà (le glissement du tableau des tâches).
  app.depuis = app.vueCourante ?? null;
  app.vueCourante = nom;
  const vue = document.getElementById('vue');
  vue.replaceChildren();
  vue.className = 'page';
  document.documentElement.style.setProperty('--h-entete', `${document.querySelector('.entete').offsetHeight}px`);
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

// Le compte à rebours suit le calendrier : on redessine au changement de jour.
let jourAffiche = new Date().toDateString();
setInterval(() => {
  const jour = new Date().toDateString();
  if (jour === jourAffiche) return;
  jourAffiche = jour;
  horloge();
  if (app.etat) rendre();
}, 60_000);

// Le carnet est écrit pendant les séances : dès qu'un fichier change, l'IHM se met à jour.
let version = null;
const enSaisie = () => ['TEXTAREA', 'INPUT'].includes(document.activeElement?.tagName) && document.activeElement.value;
setInterval(async () => {
  if (document.hidden) return;
  try {
    const { version: v } = await (await fetch('/api/version')).json();
    if (enSaisie()) return;
    if (version !== null && v !== version) await app.recharger();
    version = v;
  } catch { /* serveur arrêté : on réessaiera */ }
}, 3000);
libelleTheme();
horloge();
installerDiscord();
app.recharger().catch((e) => {
  document.getElementById('vue').replaceChildren(h('div', { classe: 'bandeau', role: 'alert' }, `Impossible de lire le carnet : ${e.message}`));
});
