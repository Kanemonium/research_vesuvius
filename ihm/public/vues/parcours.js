// Le parcours d'un domaine : derrière chaque bande de la carte, un graphe vertical des avancées.
// Pour le scan, le dépliage et l'encre, ce sont celles du défi tout entier (équipe et communauté),
// où les nôtres s'insèrent à leur date ; pour le pilotage et les outils, seulement les nôtres.
// Les données sont dans pilotage/avancees/<domaine>.yaml. Cliquer un nœud ouvre son détail,
// fonctionnel puis technique, avec le prix associé et les sources.
import { vignettes } from '../apercu.js';
import { embleme } from '../emblemes.js';
import { LIBELLES, adresse, dateLongue, h, lienId, lier } from '../outils.js';

const STATUTS = {
  acquis: { nom: 'Acquis', statut: 'faite' }, 'en-cours': { nom: 'En cours', statut: 'en-cours' }, ouvert: { nom: 'Problème ouvert', statut: 'a-faire' },
};
const TROPHEE = '<svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><path d="M6 3h8v3.500a4 4 0 0 1-8 0Zm-3 1h3v2.500A2.500 2.500 0 0 1 3.500 4Zm14 0h-3v2.500A2.500 2.500 0 0 0 16.500 4ZM9 11h2v3h2.500v2h-7v-2H9Z" fill="currentColor"/></svg>';
const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

/** Une date d'avancée peut n'être qu'une année ou un mois : on n'invente pas le jour. */
export function dateSouple(d) {
  if (!d) return 'date non donnée';
  const m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(d);
  if (!m) return d;
  if (m[3]) return dateLongue(d);
  return m[2] ? `${MOIS[Number(m[2]) - 1]} ${m[1]}` : m[1];
}
const annee = (a) => a.date?.slice(0, 4) ?? (a.statut === 'ouvert' ? 'à venir' : 's. d.');
const lienExt = (s) => h('a', { href: s.lien, target: '_blank', rel: 'noreferrer' }, `${s.titre ?? s.lien.replace(/^https:\/\/(www\.)?/, '')} ↗`);
const prixDe = (p) => h('span', { classe: 'pc-prix', title: 'Prix associé' }, h('span', { html: TROPHEE }), [p.nom, p.montant].filter(Boolean).join(' · '));

function detail(a, base, mixte, app) {
  const liees = app.etat.executions.filter((x) => a.executions.includes(x.id));
  const e = STATUTS[a.statut] ?? STATUTS.acquis;
  const bloc = (titre, contenu) => (contenu ? [h('h3', {}, titre), contenu] : null);
  return h('aside', { classe: 'carte pc-detail', 'aria-live': 'polite' },
    h('div', { classe: 'tiroir-tete' },
      h('span', { classe: 'etiquette' }, a.id), h('span', { classe: 'pilule', 'data-statut': e.statut }, e.nom),
      a.nous && mixte ? h('span', { classe: 'pilule pc-nous' }, 'Nous') : null,
      h('a', { classe: 'pc-fermer', href: base, 'aria-label': 'Fermer le détail' }, '×')),
    h('h2', { classe: 'titre' }, a.titre),
    h('p', { classe: 'meta' }, dateSouple(a.date)),
    a.noteDate ? h('p', { classe: 'pc-note-date' }, a.noteDate) : null,
    a.relu ? h('p', { classe: 'pc-relu', title: 'Chaque phrase de ce nœud a été comparée à sa page d’origine' }, 'Relu contre sa source') : null,
    a.prix ? h('p', { style: 'margin-top:10px' }, prixDe(a.prix)) : null,
    a.resume ? lier(h('p', { classe: 'pc-resume' }, a.resume)) : null,
    bloc('Ce que cela permet', a.fonctionnelHtml ? lier(h('div', { classe: 'prose', html: a.fonctionnelHtml })) : null),
    bloc('Comment c’est fait', a.techniqueHtml ? lier(h('div', { classe: 'prose', html: a.techniqueHtml })) : null),
    bloc('Qui', a.qui.length ? h('p', {}, a.qui.join(', ')) : null),
    bloc('Pour comprendre', a.fiches.length ? h('p', { classe: 'pc-liens' }, a.fiches.map((id) => lienId(id))) : null),
    bloc('Chez nous', a.pistes.length + a.executions.length ? [h('p', { classe: 'pc-liens' }, [...a.pistes, ...a.executions].map((id) => lienId(id))), vignettes(liees)] : null),
    bloc('Sources', a.sources.length ? h('ul', { classe: 'pc-sources' }, a.sources.map((s) => h('li', {}, s.lien ? lienExt(s) : s.titre))) : null));
}

function synthese(app, d, piste) {
  const { pistes, taches, fiches, executions, horizon } = app.etat;
  const nos = pistes.filter((p) => p.domaine === d.domaine && p.type !== 'domaine');
  const ouvertes = taches.filter((t) => t.statut !== 'faite' && nos.some((p) => p.id === t.piste) || t.piste === piste?.id && t.statut !== 'faite');
  const lies = executions.filter((x) => nos.some((p) => p.id === x.piste));
  const notions = fiches.filter((f) => f.pistes.some((id) => id === piste?.id || nos.some((p) => p.id === id)));
  const prix = (piste?.prix ?? []).map((id) => horizon.prix.find((x) => x.id === id)).filter(Boolean);
  const compte = (statut) => d.avancees.filter((a) => a.statut === statut).length;
  const bloc = (titre, contenu) => [h('h3', {}, titre), contenu];
  return h('aside', { classe: 'carte pc-detail' },
    h('p', { classe: 'meta' }, d.portee === 'nous' ? 'Notre parcours' : 'Le défi tout entier, et nous dedans'),
    h('h2', { classe: 'titre' }, 'Vue d’ensemble'),
    h('div', { classe: 'pc-compteurs' },
      h('div', {}, h('strong', {}, compte('acquis')), h('span', { classe: 'meta' }, 'acquis')),
      h('div', {}, h('strong', {}, compte('en-cours')), h('span', { classe: 'meta' }, 'en cours')),
      h('div', {}, h('strong', {}, compte('ouvert')), h('span', { classe: 'meta' }, 'ouverts'))),
    d.resumeHtml ? lier(h('div', { classe: 'prose', html: d.resumeHtml })) : null,
    prix.length ? bloc('Prix visés', h('p', { classe: 'pc-liens' }, prix.map((x) => prixDe({ nom: x.titre, montant: x.montant })))) : null,
    nos.length ? bloc(`Nos pistes (${nos.length})`, h('ul', { classe: 'liste' }, nos.map((p) => h('li', {}, lienId(p.id), h('span', {}, p.titre), h('span', { classe: 'fin meta' }, LIBELLES[p.statut]))))) : null,
    ouvertes.length ? bloc(`Nos tâches ouvertes (${ouvertes.length})`, h('ul', { classe: 'liste' }, ouvertes.map((t) => h('li', {}, lienId(t.id), h('span', {}, t.titre))))) : null,
    lies.length ? bloc('Nos exécutions', h('p', { classe: 'pc-liens' }, lies.map((x) => lienId(x.id)))) : null,
    notions.length ? bloc('Fiches', h('p', { classe: 'pc-liens' }, notions.map((f) => lienId(f.id)))) : null,
    h('p', { classe: 'meta', style: 'margin-top:20px;text-transform:none;letter-spacing:0' }, [d.fichier, d.lu_le ? `sources lues le ${dateLongue(d.lu_le)}` : null].filter(Boolean).join(' · ')));
}

/** Le volet « parcours » d'un domaine. « choisie » est l'identifiant de l'avancée ouverte, ou null. */
const NOMS_DOMAINE = { scan: 'Scan', depliage: 'Dépliage', encre: 'Encre', outils: 'Outils', autre: 'Autre' };
const argent = (n) => `${n.toLocaleString('fr-FR')} $`;

/** Tous les prix attribués par le défi dans ce domaine (ou dans tous), du plus récent au plus ancien. */
function listePrix(app, domaine, tous, base) {
  const { sections, source, lu_le: lu } = app.etat.prixAttribues ?? { sections: [] };
  const garde = (l) => tous || l.domaine === domaine;
  const visibles = sections.map((s) => ({ ...s, laureats: s.laureats.filter(garde) })).filter((s) => s.laureats.length);
  const nombre = visibles.reduce((n, s) => n + s.laureats.length, 0);
  const somme = visibles.reduce((n, s) => n + s.laureats.reduce((m, l) => m + l.dollars, 0), 0);
  return h('div', { classe: 'px' },
    h('div', { classe: 'px-tete' },
      h('p', {}, h('strong', {}, `${nombre} prix`), ` · ${argent(somme)}`, tous ? ' · tous domaines' : ` · ${NOMS_DOMAINE[domaine] ?? domaine}`),
      h('div', { classe: 'dsc-choix', role: 'group', 'aria-label': 'Domaines montrés' },
        h('a', { href: `${base}&vue=prix`, 'aria-pressed': String(!tous) }, 'Ce domaine'),
        h('a', { href: `${base}&vue=prix&tous=1`, 'aria-pressed': String(tous) }, 'Tous les domaines'))),
    visibles.length ? visibles.map((s) => h('section', { classe: 'px-section' },
      h('header', {}, h('span', { classe: 'px-date' }, dateSouple(s.date)), h('h3', {}, s.titre), h('span', { classe: 'meta' }, `total de la section : ${s.total}`)),
      h('ul', { classe: 'px-liste' }, s.laureats.map((l) => h('li', { 'data-domaine': l.domaine },
        h('span', { classe: 'pc-prix' }, h('span', { html: TROPHEE }), l.montant ?? '—'),
        h('div', {}, h('strong', {}, l.intitule ?? l.qui), h('span', { classe: 'px-qui' }, l.intitule ? l.qui : ''), h('p', {}, l.quoi)),
        tous ? h('span', { classe: 'pilule' }, NOMS_DOMAINE[l.domaine] ?? l.domaine) : null)))))
      : h('p', { classe: 'vide' }, 'Aucun prix relevé pour ce domaine.'),
    h('p', { classe: 'meta px-source' }, 'Rangement par domaine : le nôtre. ', source?.lien ? lienExt(source) : null, lu ? ` · lu le ${dateLongue(lu)}` : ''));
}

export function voletParcours(app, domaine, choisie, { vue = null, tous = false } = {}) {
  const d = app.etat.avancees?.[domaine];
  const piste = app.etat.pistes.find((p) => p.type === 'domaine' && p.domaine === domaine);
  const base = `#/carte?domaine=${domaine}`;
  const retour = h('a', { classe: 'bouton mini discret', href: piste ? adresse(piste.id) : '#/carte' }, '← La carte');
  const nPrix = (app.etat.prixAttribues?.sections ?? []).reduce((n, s) => n + s.laureats.filter((l) => l.domaine === domaine).length, 0);
  const enPrix = vue === 'prix';
  const bascule = h('div', { classe: 'dsc-choix pc-bascule', role: 'group', 'aria-label': 'Ce que montre le parcours' },
    h('a', { href: base, 'aria-pressed': String(!enPrix) }, 'Avancées'),
    h('a', { href: `${base}&vue=prix`, 'aria-pressed': String(enPrix) }, `Prix attribués (${nPrix})`));
  const tete = h('div', { classe: 'pc-tete' }, retour,
    h('div', { classe: 'pc-titre' }, embleme(domaine, 44), h('div', {}, h('p', { classe: 'meta' }, d?.portee === 'nous' ? 'Parcours · le nôtre' : 'Parcours · le défi tout entier'), h('h1', { classe: 'grand' }, piste?.titre ?? domaine))), bascule);
  if (!d || !d.avancees.length) {
    return h('div', { classe: 'pc' }, tete, h('div', { classe: 'vide', style: 'max-width:60ch' }, 'Aucune avancée n’est encore consignée pour ce domaine.'));
  }
  const ouverte = d.avancees.find((a) => a.id === choisie) ?? null;
  // Dans un parcours du défi tout entier, nos propres pas se distinguent : losange et pastille « Nous ».
  const mixte = d.portee === 'communaute';
  // Le graphe : une colonne par branche (un sous-sujet du domaine), une ligne par avancée.
  // Toutes les branches partagent le même axe vertical : plus bas veut dire plus tard, quelle que soit la colonne.
  const branches = d.branches.length ? d.branches : [{ id: '', titre: '' }];
  const colonne = (a) => Math.max(0, branches.findIndex((b) => b.id === a.branche)) + 2; // la colonne 1 porte les années
  const LIGNE0 = 3; // ligne 1 : la racine d'où partent les branches ; ligne 2 : leurs noms
  const n = branches.length;
  const racine = h('div', { classe: 'pb-racine', style: 'grid-column:2 / -1;grid-row:1', 'aria-hidden': 'true', html:
    `<svg viewBox="0 0 ${n * 100} 64" preserveAspectRatio="none">${branches.map((_, i) => `<path d="M${n * 50} 6C${n * 50} 40 ${i * 100 + 50} 24 ${i * 100 + 50} 64" class="pb-b${i % 6}"/>`).join('')}</svg><span class="pb-souche"></span>` });
  const entetes = branches.map((b, i) => h('div', { classe: `pb-branche pb-b${i % 6}`, style: `grid-column:${i + 2};grid-row:2` }, h('span', {}, b.titre || 'Parcours')));
  // Le rail de chaque branche : en pointillé tant qu'elle n'a rien produit, plein entre son premier et son dernier pas.
  const rails = branches.flatMap((b, i) => {
    const lignes = d.avancees.map((a, k) => (colonne(a) === i + 2 ? k : -1)).filter((k) => k >= 0);
    if (!lignes.length) return [];
    const [premier, dernier] = [lignes[0] + LIGNE0, lignes.at(-1) + LIGNE0];
    return [premier > LIGNE0 ? h('div', { classe: `pb-rail attente pb-b${i % 6}`, style: `grid-column:${i + 2};grid-row:${LIGNE0} / ${premier}`, 'aria-hidden': 'true' }) : null,
      h('div', { classe: `pb-rail pb-b${i % 6}`, style: `grid-column:${i + 2};grid-row:${premier} / ${dernier + 1}`, 'aria-hidden': 'true' })];
  });
  let derniere = null;
  const noeuds = d.avancees.flatMap((a, k) => {
    const e = STATUTS[a.statut] ?? STATUTS.acquis;
    const ligne = k + LIGNE0;
    const rupture = annee(a) !== derniere ? h('div', { classe: 'pb-annee', style: `grid-column:1 / -1;grid-row:${ligne}`, 'aria-hidden': 'true' }, h('span', {}, annee(a))) : null;
    derniere = annee(a);
    const b = colonne(a) - 2;
    return [rupture, h('div', { classe: `pb-noeud pb-b${b % 6}`, style: `grid-column:${b + 2};grid-row:${ligne}`, 'data-statut': a.statut, 'data-nous': a.nous && mixte ? 'oui' : null },
      h('span', { classe: 'pb-point', 'aria-hidden': 'true' }),
      h('a', { classe: 'pb-carte', href: `${base}&a=${a.id}`, 'aria-current': a.id === choisie ? 'true' : null, title: a.resume },
        h('span', { classe: 'pb-ligne' }, h('span', { classe: 'meta' }, dateSouple(a.date)), h('span', { classe: 'pb-statut', 'data-statut': e.statut }, e.nom)),
        h('strong', { classe: 'pb-nom' }, a.titre),
        h('span', { classe: 'pb-ligne' }, h('span', { classe: 'pb-rappel' }, branches[b]?.titre ?? ''), a.nous && mixte ? h('span', { classe: 'pilule pc-nous' }, 'Nous') : null, a.prix ? prixDe({ montant: a.prix.montant }) : null)))];
  });
  const graphe = h('div', { classe: 'pb-graphe', style: `--branches:${n}`, role: 'list' }, racine, entetes, rails, noeuds);
  const volet = h('div', { classe: 'pc' }, tete, h('div', { classe: 'pc-corps' }, h('div', { classe: 'pc-defile' }, enPrix ? listePrix(app, domaine, tous, base) : graphe), ouverte ? detail(ouverte, base, mixte, app) : synthese(app, d, piste)));
  // Le nœud ouvert reste en vue dans la colonne du graphe.
  if (ouverte) requestAnimationFrame(() => graphe.querySelector('[aria-current="true"]')?.scrollIntoView({ block: 'nearest' }));
  return volet;
}
