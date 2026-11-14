// Vue « Doc » : une fiche illustrée par notion, en français ou en anglais.
// Les fiches sont des fichiers Markdown de docs/concepts/, lisibles aussi directement sur GitHub.
import { embleme } from '../emblemes.js';
import { adresse, h, lier } from '../outils.js';

const TEXTES = {
  fr: {
    surtitre: '06/06 · Documentation', titre: 'Les notions',
    intro: "Une fiche par notion rencontrée : ce que c'est, comment ça marche, et pourquoi ça compte pour notre épopée.",
    pistes: 'Sur la carte', source: 'Source', precedente: '← Précédente', suivante: 'Suivante →', langue: 'Langue des fiches',
    domaines: { defi: 'Papyrologie', scan: 'Scan', depliage: 'Dépliage', encre: 'Encre', outils: 'Données et outils', pilotage: 'Pilotage' },
  },
  en: {
    surtitre: '06/06 · Documentation', titre: 'Concepts',
    intro: 'One note per idea we run into: what it is, how it works, and why it matters for this project.',
    pistes: 'On the map', source: 'Source', precedente: '← Previous', suivante: 'Next →', langue: 'Language of the notes',
    domaines: { defi: 'Papyrology', scan: 'Scanning', depliage: 'Unwrapping', encre: 'Ink', outils: 'Data and tools', pilotage: 'Steering' },
  },
};

export function vueDoc(vue, app, params) {
  const { fiches, pistes } = app.etat;
  const lg = app.langue();
  const t = TEXTES[lg];
  const fiche = fiches.find((f) => f.id === params.get('id')) ?? fiches[0];

  const bascule = h('div', { classe: 'bascule', role: 'group', 'aria-label': t.langue },
    ['fr', 'en'].map((code) => h('button', { type: 'button', 'aria-pressed': String(code === lg), onclick: () => app.choisirLangue(code) },
      code === 'fr' ? 'Français' : 'English')));

  vue.append(h('div', { classe: 'vue-tete' },
    h('div', {}, h('p', { classe: 'meta' }, t.surtitre), h('h1', { classe: 'grand' }, t.titre)),
    h('div', { style: 'display:flex;flex-direction:column;align-items:flex-end;gap:10px' }, bascule, h('p', { classe: 'doux', style: 'text-align:right' }, t.intro))));

  if (!fiche) {
    vue.append(h('div', { classe: 'vide' }, 'Aucune fiche pour l’instant.'));
    return;
  }

  // Sommaire, regroupé par domaine dans l'ordre des fiches.
  const domaines = [...new Set(fiches.map((f) => f.domaine))];
  const sommaire = h('nav', { classe: 'doc-liste carte', 'aria-label': t.titre }, domaines.map((d) => [
    h('h2', { classe: 'cond avec-embleme' }, embleme(d, 26), t.domaines[d] ?? d),
    h('ul', {}, fiches.filter((f) => f.domaine === d).map((f) => h('li', {},
      h('a', { href: adresse(f.id), 'aria-current': f.id === fiche.id ? 'page' : null },
        h('span', { classe: 'mono' }, f.id), h('span', {}, f[lg].titre))))),
  ]));

  const x = fiche[lg];
  const i = fiches.indexOf(fiche);
  const liees = fiche.pistes.map((id) => pistes.find((p) => p.id === id)).filter(Boolean);
  const article = h('article', { classe: 'fiche', lang: lg },
    h('div', { classe: 'tiroir-tete' }, embleme(fiche.domaine, 44), h('span', { classe: 'etiquette' }, fiche.id),
      h('span', { classe: 'meta' }, t.domaines[fiche.domaine] ?? fiche.domaine)),
    h('h2', { classe: 'fiche-titre' }, x.titre),
    h('p', { classe: 'fiche-resume' }, x.resume),
    h('figure', {}, h('img', { src: `/concepts/${fiche.image}`, alt: x.alt, width: 640, height: 360 })),
    x.sections.map((sec) => [h('h3', {}, sec.titre), lier(h('div', { classe: 'prose', html: sec.html }))]),
    h('h3', {}, t.pistes),
    h('p', { classe: 'fiche-pistes' }, liees.map((p) => h('a', { classe: 'pilule', href: adresse(p.id) }, embleme('carte', 15), `${p.id} · ${p.titre}`))),
    h('p', { classe: 'meta', style: 'margin-top:20px;text-transform:none;letter-spacing:0' },
      fiche.source ? [h('a', { href: fiche.source, target: '_blank', rel: 'noreferrer' }, `${t.source} ↗`), ' · '] : null, x.fichier),
    h('div', { classe: 'fiche-pied' },
      i > 0 ? h('a', { classe: 'bouton discret', href: adresse(fiches[i - 1].id) }, t.precedente) : h('span'),
      i < fiches.length - 1 ? h('a', { classe: 'bouton', href: adresse(fiches[i + 1].id) }, t.suivante) : h('span')));

  vue.append(h('div', { classe: 'doc-vue' }, sommaire, article));
}
