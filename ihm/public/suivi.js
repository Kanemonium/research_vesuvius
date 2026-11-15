// Suivi d'une exécution dans la page : la barre de progression, le bouton du journal et sa fenêtre.
// Les chiffres viennent du serveur (ihm/lib/suivi.mjs), qui les lit dans le journal de l'exécution.
import { embleme } from './emblemes.js';
import { LIBELLES, envoyer, glyphe, h } from './outils.js';

const nb = (v) => v.toLocaleString('fr-FR');

// Les boutons ne portent aucun texte : une icône, et un fond qui dit l'état. Le nom est dans « aria-label » et l'infobulle.
const ICONES = {
  // Une feuille de journal : trois lignes de texte.
  journal: '<path d="M5 3.5h7.2L15 6.3V16a.5.5 0 0 1-.5.5h-9A.5.5 0 0 1 5 16Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M7.4 8.6h5.2M7.4 11h5.2M7.4 13.4h3.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
  pause: '<rect x="5.6" y="4.6" width="3.2" height="10.8" rx="1" fill="currentColor"/><rect x="11.2" y="4.6" width="3.2" height="10.8" rx="1" fill="currentColor"/>',
  reprendre: '<path d="M7 4.4v11.2a.6.6 0 0 0 .92.5l8.6-5.6a.6.6 0 0 0 0-1L7.92 3.9A.6.6 0 0 0 7 4.4Z" fill="currentColor"/>',
};
function icone(nom) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  for (const [k, v] of Object.entries({ viewBox: '0 0 20 20', width: 18, height: 18, 'aria-hidden': 'true' })) svg.setAttribute(k, v);
  svg.innerHTML = ICONES[nom];
  return svg;
}

/** L'état à montrer : ce que le lanceur a écrit l'emporte sur ce que dit la page de l'exécution. */
export const etatDe = (x) => x.suivi?.etat ?? x.statut;

function duree(debut, fin) {
  const s = Math.round((new Date(fin) - new Date(debut)) / 1000);
  if (!Number.isFinite(s) || s < 0) return null;
  const hh = Math.floor(s / 3600); const mm = Math.floor((s % 3600) / 60);
  return hh ? `${hh} h ${String(mm).padStart(2, '0')}` : mm ? `${mm} min ${String(s % 60).padStart(2, '0')} s` : `${s} s`;
}

/** Texte et remplissage de la barre pour un suivi donné. Renvoie null s'il n'y a rien à montrer. */
function lecture(suivi) {
  if (!suivi?.etat) return null;
  const p = suivi.progression;
  const part = p?.total ? Math.min(100, (p.fait / p.total) * 100) : null;
  if (suivi.etat === 'terminee') {
    const d = suivi.debut && suivi.fin ? duree(suivi.debut, suivi.fin) : null;
    return { part: 100, texte: ['Terminée', d ? `en ${d}` : null, p ? `${nb(p.total)} / ${nb(p.total)}` : null].filter(Boolean).join(' · ') };
  }
  if (suivi.etat === 'echouee') {
    return { part: part ?? 100, texte: [`Arrêtée (code ${suivi.code})`, p ? `à ${nb(p.fait)} / ${nb(p.total)}` : null].filter(Boolean).join(' · ') };
  }
  // En plusieurs étapes : la barre dit l'avancement de l'ensemble, le texte dit aussi où en est l'étape.
  const e = suivi.etape;
  const ensemble = e ? ((e.numero - 1) + (part ?? 0) / 100) / e.total * 100 : part;
  const etape = e ? `${e.libelle} ${e.numero}/${e.total}` : null;
  const pause = suivi.etat === 'en-pause' ? `En pause depuis ${new Date(suivi.pause).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` : null;
  if (!p) {
    const attente = suivi.journal ? 'pas encore de progression dans le journal' : 'en attente du journal';
    // Un programme sans barre de progression (la prédiction de villa) n'avance que d'étape en étape.
    return { part: e ? ensemble : null, texte: [pause ?? 'En cours', etape, e ? null : attente].filter(Boolean).join(' · ') };
  }
  const muet = !pause && suivi.silence > 120 ? `rien de nouveau depuis ${Math.round(suivi.silence / 60)} min` : null;
  return {
    part: ensemble,
    texte: [pause, `${Math.floor(ensemble)} %`, etape, `${nb(p.fait)} / ${nb(p.total)}`, !pause && p.restant ? `reste ${p.restant}${e ? ' pour cette étape' : ''}` : null, pause ? null : p.vitesse, muet].filter(Boolean).join(' · '),
  };
}

/** Barre de progression d'une exécution. Se remet à jour avec majSuivi(). */
export function avancement(x) {
  const el = h('div', { classe: 'avancement', 'data-suivi': x.id, role: 'progressbar', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-label': `Avancement de ${x.id}` },
    h('div', { classe: 'avancement-piste' }, h('i')), h('span', { classe: 'meta avancement-texte' }));
  peindreAvancement(el, x.suivi);
  return el;
}
function peindreAvancement(el, suivi) {
  const l = lecture(suivi);
  el.hidden = !l;
  if (!l) return;
  el.dataset.etat = suivi.etat;
  el.classList.toggle('indetermine', l.part === null);
  el.querySelector('i').style.width = l.part === null ? '' : `${l.part.toFixed(1)}%`;
  if (l.part === null) el.removeAttribute('aria-valuenow'); else el.setAttribute('aria-valuenow', Math.round(l.part));
  el.querySelector('.avancement-texte').textContent = l.texte;
}

/** Bouton qui ouvre le journal : une onde tant que l'exécution tourne, vert une fois terminée. */
export function boutonJournal(x) {
  const el = h('button', { classe: 'bouton-rond journal-bouton', type: 'button', 'data-suivi-bouton': x.id, onclick: (e) => { e.stopPropagation(); ouvrirJournal(x); } }, icone('journal'));
  peindreBouton(el, x.suivi);
  return el;
}
function peindreBouton(el, suivi) {
  const etat = suivi?.etat ?? 'aucun';
  el.dataset.etat = suivi?.journal ? etat : 'aucun';
  el.disabled = !suivi?.journal;
  el.setAttribute('aria-label', !suivi?.journal ? 'Pas encore de journal' : etat === 'en-cours' ? 'Ouvrir le journal en direct' : 'Ouvrir le journal');
  el.title = !suivi?.journal ? 'Le journal apparaît dès que l’exécution est lancée.'
    : etat === 'en-cours' ? 'L’exécution tourne : ouvrir son journal en direct' : etat === 'terminee' ? 'Exécution terminée : ouvrir son journal' : 'Ouvrir le journal';
}

/** Bouton « Pause » ou « Reprendre » : gèle le programme tel quel, ou le relance. Caché hors exécution. */
export function boutonPause(x) {
  const el = h('button', { classe: 'bouton-rond pause-bouton', type: 'button', 'data-suivi-pause': x.id });
  el.addEventListener('click', async (evt) => {
    evt.stopPropagation();
    const action = el.dataset.etat === 'en-pause' ? 'reprendre' : 'pause';
    el.disabled = true;
    try {
      const r = await envoyer('POST', `/api/executions/${x.id}/action`, { action });
      majSuivi({ [x.id]: r.suivi });
    } catch (e) { alert(`${action === 'pause' ? 'Pause' : 'Reprise'} impossible : ${e.message}`); }
    el.disabled = false;
  });
  peindrePause(el, x.suivi);
  return el;
}
function peindrePause(el, suivi) {
  const etat = suivi?.etat;
  el.hidden = etat !== 'en-cours' && etat !== 'en-pause';
  el.dataset.etat = etat ?? '';
  el.replaceChildren(icone(etat === 'en-pause' ? 'reprendre' : 'pause'));
  el.setAttribute('aria-label', etat === 'en-pause' ? 'Reprendre l’exécution' : 'Mettre l’exécution en pause');
  el.title = etat === 'en-pause' ? 'Relancer le programme là où il s’était arrêté' : 'Geler le programme : rien n’est perdu, la reprise est immédiate';
}

/** Applique à la page les suivis reçus du serveur : { 'X-003': suivi, … }. */
export function majSuivi(suivis) {
  for (const el of document.querySelectorAll('[data-suivi-pause]')) if (suivis[el.dataset.suiviPause]) peindrePause(el, suivis[el.dataset.suiviPause]);
  for (const el of document.querySelectorAll('[data-suivi]')) if (suivis[el.dataset.suivi]) peindreAvancement(el, suivis[el.dataset.suivi]);
  for (const el of document.querySelectorAll('[data-suivi-bouton]')) if (suivis[el.dataset.suiviBouton]) peindreBouton(el, suivis[el.dataset.suiviBouton]);
}

// ---------------------------------------------------------------- Fenêtre du journal
const LIGNES_MAX = 4000;
let fenetre = null;
let releve = null;

function fermer() {
  clearInterval(releve);
  releve = null;
}

/** Ouvre le journal d'une exécution. Tant qu'elle tourne, les nouvelles lignes arrivent toutes les secondes et demie. */
export function ouvrirJournal(x) {
  if (!fenetre) {
    fenetre = h('dialog', { classe: 'journal-fenetre', 'aria-labelledby': 'journal-titre' });
    fenetre.addEventListener('close', fermer);
    fenetre.addEventListener('click', (e) => { if (e.target === fenetre) fenetre.close(); });
    document.body.append(fenetre);
  }
  fermer();
  const texte = h('pre', { classe: 'journal journal-flux', tabindex: 0 });
  const etat = h('span', { classe: 'pilule' });
  const barre = avancement({ id: x.id, suivi: x.suivi });
  barre.removeAttribute('data-suivi');
  const pied = h('span', { classe: 'meta' });
  const suivre = h('input', { type: 'checkbox', checked: true });
  fenetre.replaceChildren(
    h('header', { classe: 'journal-tete' },
      embleme('executions', 34),
      h('div', { style: 'min-width:0;flex:1' }, h('p', { classe: 'meta' }, `${x.id} · journal`), h('h2', { classe: 'titre', id: 'journal-titre' }, x.titre)),
      etat,
      h('button', { classe: 'bouton discret mini', type: 'button', onclick: () => fenetre.close() }, 'Fermer')),
    barre, texte,
    h('footer', { classe: 'journal-pied' }, h('label', { classe: 'meta' }, suivre, ' Suivre la fin du journal'), pied));

  const lignes = []; let courante = ''; let retour = false; let suite = 0; let occupe = false;
  // Un retour chariot (\r) réécrit la ligne en cours : c'est ainsi qu'une barre de progression avance sur place.
  const ajouter = (morceau) => {
    for (const part of morceau.split(/(\r\n|\n|\r)/)) {
      if (part === '\n' || part === '\r\n') { lignes.push(courante); courante = ''; retour = false; }
      else if (part === '\r') retour = true;
      else if (part) { courante = retour ? part : courante + part; retour = false; }
    }
    if (lignes.length > LIGNES_MAX) lignes.splice(0, lignes.length - LIGNES_MAX);
    texte.textContent = lignes.join('\n') + (courante ? `\n${courante}` : '');
    if (suivre.checked) texte.scrollTop = texte.scrollHeight;
  };
  const charger = async () => {
    if (occupe) return;
    occupe = true;
    try {
      const r = await (await fetch(`/api/executions/${x.id}/journal?depuis=${suite}`)).json();
      if (r.erreur) throw new Error(r.erreur);
      if (r.tronque && suite === 0) ajouter('[… début du journal non affiché …]\n');
      if (r.texte) ajouter(r.texte);
      suite = r.suite;
      const e = r.suivi.etat ?? x.statut;
      etat.dataset.statut = e;
      etat.replaceChildren(glyphe(e, 13), LIBELLES[e] ?? e);
      peindreAvancement(barre, r.suivi);
      pied.textContent = `${nb(Math.round(r.suivi.taille / 1024))} Ko${r.brut ? ' · journal complet' : ' · journal condensé'}${r.suivi.picVram ? ` · pic de mémoire vidéo ${nb(r.suivi.picVram)} Mo` : ''}`;
      if (e !== 'en-cours' && !r.texte) fermer();
    } catch (err) {
      pied.textContent = `Journal indisponible : ${err.message}`;
    } finally { occupe = false; }
  };
  fenetre.showModal();
  charger();
  releve = setInterval(charger, 1500);
}
