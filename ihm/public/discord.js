// Le tiroir Discord : plaqué à droite, ouvert par une tirette à mi-hauteur ou par l'icône de la barre du haut.
// Il ne parle jamais à Discord. Il montre la dernière lecture qu'Agent C. a rangée sur la machine
// (/api/discord), traduite en français, avec nos propres réponses insérées à leur date.
import { h } from './outils.js';

const LOGO = 'M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z';
const CLOCHE = 'M12 3a5 5 0 0 0-5 5v3.2l-1.6 3.3a.6.6 0 0 0 .54.86h12.12a.6.6 0 0 0 .54-.86L17 11.2V8a5 5 0 0 0-5-5Zm-2 14.4a2 2 0 0 0 4 0Z';
const ONGLETS = { synthese: 'Synthèse', 'pour-moi': 'Pour moi', actu: 'Actu' };

function svg(chemin, taille) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  for (const [k, v] of Object.entries({ viewBox: '0 0 24 24', width: taille, height: taille, 'aria-hidden': 'true' })) el.setAttribute(k, v);
  el.innerHTML = `<path d="${chemin}" fill="currentColor"/>`;
  return el;
}

const memoire = (cle, defaut) => { try { return localStorage.getItem(cle) ?? defaut; } catch { return defaut; } };
const retenir = (cle, v) => { try { localStorage.setItem(cle, v); } catch { /* le choix vaut pour la page */ } };

const etat = { ouvert: false, onglet: memoire('discord-onglet', 'synthese'), probleme: memoire('discord-probleme', 'encre'), donnees: null, demande: null };
if (!ONGLETS[etat.onglet]) etat.onglet = 'synthese';

function quand(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso ?? '');
  return d.toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
function age(d) {
  if (d.age_heures === null) return 'Jamais lu';
  if (d.age_heures < 1) return `Lu il y a ${Math.max(1, Math.round(d.age_heures * 60))} min`;
  return `Lu il y a ${Math.round(d.age_heures)} h`;
}
const liens = (l) => (l?.length ? h('p', { classe: 'tiroir-liens' }, ...l.map((u) => h('a', { href: u, target: '_blank', rel: 'noreferrer' }, u.replace(/^https:\/\/(www\.)?/, '')))) : null);

// Une couleur par personne, tirée de son nom : la même personne garde la même d'une lecture à l'autre.
function teinte(nom) {
  let n = 0;
  for (const c of String(nom)) n = (n * 31 + c.codePointAt(0)) % 360;
  return n;
}
function initiales(nom) {
  const mots = String(nom).replace(/[^\p{L}\p{N} ._-]/gu, '').split(/[ ._-]+/).filter(Boolean);
  const lettres = mots.length > 1 ? mots[0][0] + mots[1][0] : (mots[0] ?? '?').slice(0, 2);
  return lettres.toUpperCase();
}
/** La photo de profil si la lecture l'a relevée ; sinon une pastille aux initiales, de la couleur de la personne. */
function avatar(nom, image) {
  const pastille = h('span', { classe: 'tiroir-avatar', style: `--teinte:${teinte(nom)}`, 'aria-hidden': 'true' }, initiales(nom));
  if (!image) return pastille;
  const img = h('img', { src: image, alt: '', loading: 'lazy', referrerpolicy: 'no-referrer' });
  img.addEventListener('error', () => img.remove());
  pastille.append(img);
  return pastille;
}
const CALENDRIER = 'M7 2.5a1 1 0 0 1 1 1V5h8V3.5a1 1 0 1 1 2 0V5h1a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h1V3.5a1 1 0 0 1 1-1ZM5 10v9h14v-9Z';
const PERSONNES = 'M9 4a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Zm7.5 1.5a2.75 2.75 0 1 1 0 5.5 2.75 2.75 0 0 1 0-5.5ZM2.5 18.2c0-3 2.9-5.2 6.5-5.2s6.5 2.200 6.500 5.200V19a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1Zm15 1.800v-1.800c0-1.500-.5-2.800-1.400-3.900.2 0 .3 0 .4 0 2.800 0 5 1.700 5 4V19a1 1 0 0 1-1 1Z';
const reperes = (m) => h('p', { classe: 'tiroir-reperes' },
  m.salon ? h('span', { classe: 'tiroir-salon' }, h('b', { 'aria-hidden': 'true' }, '#'), m.salon) : null,
  h('span', { classe: 'tiroir-date' }, svg(CALENDRIER, 13), quand(m.date)));

function message(m) {
  const nom = m.nous ? 'Nous' : m.auteur ?? '—';
  return h('article', { classe: 'tiroir-message', 'data-nous': m.nous ? 'oui' : null, style: `--teinte:${teinte(nom)}` },
    h('header', {},
      avatar(nom, m.avatar),
      h('strong', {}, nom),
      m.nous ? h('span', { classe: 'pilule', 'data-statut': m.statut === 'envoyee' ? 'faite' : 'a-faire' }, m.statut === 'envoyee' ? 'envoyée' : 'brouillon') : null,
      reperes(m)),
    m.fil ? h('p', { classe: 'tiroir-fil' }, m.fil) : null,
    h('p', {}, m.nous ? m.texte_fr ?? m.texte : m.texte),
    // Nos réponses partent en anglais : le texte exact reste lisible sous sa traduction.
    m.nous && m.texte_en ? h('details', {}, h('summary', {}, 'Texte anglais'), h('p', { lang: 'en' }, m.texte_en)) : null,
    liens(m.liens));
}

function corps(d) {
  const p = d.problemes[etat.probleme] ?? Object.values(d.problemes)[0];
  if (etat.onglet === 'pour-moi') {
    return d.pour_moi.length ? d.pour_moi.map(message) : [h('p', { classe: 'tiroir-vide' }, d.pour_moi_note || 'Aucun message ne vous mentionne.')];
  }
  if (etat.onglet === 'actu') return p.actu.length ? p.actu.map(message) : [h('p', { classe: 'tiroir-vide' }, 'Rien de lu sur ce problème.')];
  return p.synthese.length ? p.synthese.map((s) => h('article', { classe: 'tiroir-point', 'data-poids': s.pour_nous ?? null },
    h('h3', {}, s.titre), h('p', {}, s.texte),
    s.auteurs?.length ? h('p', { classe: 'tiroir-auteurs' }, svg(PERSONNES, 14), h('span', { classe: 'meta' }, 'D’après'),
      ...s.auteurs.map((a) => h('span', { classe: 'tiroir-auteur' }, avatar(a), a))) : null, liens(s.liens)))
    : [h('p', { classe: 'tiroir-vide' }, 'Pas encore de synthèse sur ce problème.')];
}

async function demander() {
  etat.demande = 'envoi';
  dessiner();
  try {
    const r = await fetch('/api/boite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ texte: 'Discord : merci de faire une lecture des salons du défi et de mettre le tiroir à jour.' }) });
    etat.demande = r.ok ? 'faite' : 'echec';
  } catch { etat.demande = 'echec'; }
  dessiner();
}

function dessiner() {
  const d = etat.donnees;
  const tiroir = document.getElementById('tiroir');
  tiroir.dataset.ouvert = etat.ouvert ? 'oui' : 'non';
  tiroir.inert = !etat.ouvert;
  for (const b of document.querySelectorAll('[data-discord]')) {
    b.setAttribute('aria-expanded', String(etat.ouvert));
    b.dataset.alerte = d?.a_relire ? 'oui' : 'non';
    b.title = !d ? 'Discord' : d.a_relire ? `Discord : ${age(d).toLowerCase()}, plus de ${d.delai_heures} h sans lecture` : `Discord : ${age(d).toLowerCase()}`;
  }
  if (!d) return;
  const avecChoix = etat.onglet !== 'pour-moi';
  tiroir.replaceChildren(
    h('header', { classe: 'tiroir-tete' },
      h('span', { classe: 'tiroir-logo' }, svg(LOGO, 22)),
      h('div', {}, h('h2', {}, 'Discord du défi'), h('p', { classe: 'meta', 'data-alerte': d.a_relire ? 'oui' : null }, d.erreur ?? age(d))),
      h('button', { classe: 'pilule', type: 'button', disabled: etat.demande === 'envoi' || etat.demande === 'faite' ? '' : null, onclick: demander },
        etat.demande === 'faite' ? 'Demande déposée' : etat.demande === 'echec' ? 'Échec, réessayer' : 'Demander une lecture'),
      h('button', { classe: 'tiroir-fermer', type: 'button', 'aria-label': 'Fermer le tiroir', onclick: () => basculer(false) }, '×')),
    h('nav', { classe: 'tiroir-onglets', role: 'tablist' }, ...Object.entries(ONGLETS).map(([cle, nom]) =>
      h('button', { type: 'button', role: 'tab', 'aria-selected': String(cle === etat.onglet), onclick: () => { etat.onglet = cle; retenir('discord-onglet', cle); dessiner(); } },
        nom, cle === 'pour-moi' && d.pour_moi.length ? h('span', { classe: 'tiroir-compte' }, String(d.pour_moi.length)) : null))),
    avecChoix ? h('div', { classe: 'tiroir-choix', role: 'group', 'aria-label': 'Problème' }, ...Object.entries(d.problemes).map(([cle, p]) =>
      h('button', { type: 'button', 'aria-pressed': String(cle === etat.probleme), onclick: () => { etat.probleme = cle; retenir('discord-probleme', cle); dessiner(); } }, p.nom))) : null,
    h('div', { classe: 'tiroir-corps' }, ...corps(d),
      d.non_lu && etat.onglet !== 'pour-moi' ? h('p', { classe: 'tiroir-note' }, h('strong', {}, 'Non lu cette fois : '), d.non_lu) : null,
      h('p', { classe: 'tiroir-note' }, 'Lecture faite à votre demande, traduite et résumée par Agent C. Ces messages restent sur cette machine : rien n’en est copié dans le dépôt public.')));
}

async function charger() {
  try { etat.donnees = await (await fetch('/api/discord')).json(); } catch { /* serveur arrêté : on réessaiera */ }
  dessiner();
}

function basculer(ouvert = !etat.ouvert) {
  etat.ouvert = ouvert;
  if (ouvert) { etat.demande = null; charger(); } else dessiner();
}

export function installerDiscord() {
  const tirette = h('button', { classe: 'tirette', type: 'button', 'data-discord': 'tirette', 'aria-label': 'Ouvrir le tiroir Discord', 'aria-controls': 'tiroir', onclick: () => basculer() },
    svg(LOGO, 22), h('span', { classe: 'tirette-prise', 'aria-hidden': 'true' }));
  const cloche = h('button', { classe: 'entete-discord', type: 'button', 'data-discord': 'cloche', 'aria-label': 'Discord : ouvrir le tiroir', 'aria-controls': 'tiroir', onclick: () => basculer() },
    svg(LOGO, 20), h('span', { classe: 'entete-discord-cloche', 'aria-hidden': 'true' }, svg(CLOCHE, 13)));
  document.querySelector('.entete-fin').prepend(cloche);
  document.body.append(h('aside', { classe: 'tiroir', id: 'tiroir', 'aria-label': 'Discord du défi' }), tirette);
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && etat.ouvert) basculer(false); });
  charger();
  // L'alerte « plus de huit heures » doit apparaître d'elle-même : on relit l'âge de la lecture chaque minute.
  setInterval(() => { if (!document.hidden) charger(); }, 60_000);
}
