// Les questions posées sous une image d'exécution : une assertion d'Agent C., que Kanemonium confirme,
// infirme, ou laisse en suspens, avec un mot s'il veut. Chaque réponse est enregistrée aussitôt.
import { envoyer, h } from './outils.js';

const CHOIX = [['confirme', 'Je confirme'], ['infirme', 'J’infirme'], ['ne-sait-pas', 'Je ne sais pas']];

/** Le bloc de questions d'une sortie, ou null si elle n'en a pas. */
export function qcm(sortie, x) {
  const questions = Array.isArray(sortie.questions) ? sortie.questions : [];
  if (!questions.length || !x) return null;
  x.reponses ??= {};
  return h('div', { classe: 'qcm' },
    h('p', { classe: 'meta qcm-titre' }, questions.length > 1 ? 'À confirmer ou infirmer' : 'À confirmer ou infirmer'),
    questions.map((q) => {
      const etat = h('span', { classe: 'meta qcm-etat', role: 'status' });
      const note = h('input', { classe: 'champ qcm-note', type: 'text', maxlength: 1000, placeholder: 'Un mot, si vous voulez', 'aria-label': `Remarque sur ${q.id}`, value: x.reponses[q.id]?.note ?? '' });
      const bloc = h('fieldset', { classe: 'qcm-question', 'data-choix': x.reponses[q.id]?.choix ?? '' });
      const enregistrer = async (choix) => {
        if (!choix) return;
        etat.textContent = 'Enregistrement…';
        try {
          const { reponses } = await envoyer('POST', `/api/executions/${x.id}/reponses`, { question: q.id, choix, note: note.value });
          x.reponses = reponses;
          bloc.dataset.choix = choix;
          for (const b of bloc.querySelectorAll('button[data-choix]')) b.setAttribute('aria-pressed', String(b.dataset.choix === choix));
          etat.textContent = 'Enregistré';
        } catch (e) { etat.textContent = e.message; }
      };
      note.addEventListener('change', () => enregistrer(bloc.dataset.choix));
      bloc.append(
        h('legend', {}, h('span', { classe: 'numero' }, q.id.replace(/^Q/, '')), h('span', {}, q.assertion)),
        h('div', { classe: 'qcm-choix' }, CHOIX.map(([cle, nom]) =>
          h('button', { type: 'button', 'data-choix': cle, 'aria-pressed': String(x.reponses[q.id]?.choix === cle), onclick: () => enregistrer(cle) }, nom))),
        h('div', { classe: 'qcm-pied' }, note, etat));
      return bloc;
    }));
}
