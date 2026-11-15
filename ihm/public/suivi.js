// Suivi d'une exécution dans la page : la barre de progression, le bouton du journal et sa fenêtre.
// Les chiffres viennent du serveur (ihm/lib/suivi.mjs), qui les lit dans le journal de l'exécution.
import { embleme } from './emblemes.js';
import { LIBELLES, glyphe, h } from './outils.js';

const nb = (v) => v.toLocaleString('fr-FR');

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
  if (!p) return { part: null, texte: suivi.journal ? 'En cours · pas encore de progression dans le journal' : 'En cours · en attente du journal' };
  const muet = suivi.silence > 120 ? `rien de nouveau depuis ${Math.round(suivi.silence / 60)} min` : null;
  return {
    part,
    texte: [`${Math.floor(part)} %`, `${nb(p.fait)} / ${nb(p.total)}`, p.restant ? `reste ${p.restant}` : null, p.vitesse, muet].filter(Boolean).join(' · '),
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
  const el = h('button', { classe: 'journal-bouton', type: 'button', 'data-suivi-bouton': x.id, onclick: (e) => { e.stopPropagation(); ouvrirJournal(x); } },
    h('span', { classe: 'journal-temoin', 'aria-hidden': 'true' }), h('span', { classe: 'journal-libelle' }));
  peindreBouton(el, x.suivi);
  return el;
}
function peindreBouton(el, suivi) {
  const etat = suivi?.etat ?? 'aucun';
  el.dataset.etat = suivi?.journal ? etat : 'aucun';
  el.disabled = !suivi?.journal;
  el.querySelector('.journal-libelle').textContent = !suivi?.journal ? 'Pas de journal' : etat === 'en-cours' ? 'Journal en direct' : 'Journal';
  el.title = !suivi?.journal ? 'Le journal apparaît dès que l’exécution est lancée.'
    : etat === 'en-cours' ? 'L’exécution tourne : ouvrir son journal en direct' : etat === 'terminee' ? 'Exécution terminée : ouvrir son journal' : 'Ouvrir le journal';
}

/** Applique à la page les suivis reçus du serveur : { 'X-003': suivi, … }. */
export function majSuivi(suivis) {
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
