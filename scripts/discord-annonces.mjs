// Lit, avec un robot officiel, le salon de NOTRE serveur où Discord recopie les annonces du défi.
//
//   node --env-file=.env scripts/discord-annonces.mjs
//
// Kanemonium « suit » le salon des annonces du défi : Discord en recopie chaque nouveau message dans
// un salon de son propre serveur. Un robot invité sur ce serveur (droits : voir le salon, lire
// l'historique) y lit ces messages par l'API prévue pour cela. Rien ne passe par le compte de
// Kanemonium, et le robot n'est pas sur le serveur du défi.
//
// Réglages attendus dans .env (jamais versionné) :
//   DISCORD_BOT_TOKEN        le jeton du robot
//   DISCORD_SALON_ANNONCES   l'identifiant du salon suivi, sur notre serveur
// Écrit local/discord/annonces-brut.json (ignoré par git). Le jeton n'est écrit ni affiché nulle part.
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const RACINE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const API = 'https://discord.com/api/v10';
const jeton = process.env.DISCORD_BOT_TOKEN;
const salon = process.env.DISCORD_SALON_ANNONCES;
if (!jeton) throw new Error('DISCORD_BOT_TOKEN absent : lancer avec --env-file=.env');
if (!/^\d{15,22}$/.test(salon ?? '')) throw new Error('DISCORD_SALON_ANNONCES absent ou invalide dans .env');

async function appel(chemin) {
  const r = await fetch(API + chemin, { headers: { Authorization: `Bot ${jeton}`, 'User-Agent': 'DiscordBot (research-cockpit, 0.1)' } });
  if (!r.ok) {
    const corps = await r.json().catch(() => ({}));
    throw new Error(`Discord répond ${r.status} pour ${chemin.split('?')[0]} : ${corps.message ?? 'sans message'}`);
  }
  return r.json();
}

/** Un message tel que le tiroir en a besoin : rien de plus que ce qui s'affiche dans le salon. */
function fiche(m) {
  return {
    id: m.id,
    date: m.timestamp,
    modifie: m.edited_timestamp ?? null,
    auteur: m.author?.global_name ?? m.author?.username ?? null,
    // Un message recopié par « Suivre » porte la marque de son salon d'origine.
    recopie: Boolean(m.flags & 2),
    origine: m.message_reference ? { serveur: m.message_reference.guild_id ?? null, salon: m.message_reference.channel_id ?? null, message: m.message_reference.message_id ?? null } : null,
    genre: m.type,
    texte: m.content ?? '',
    encarts: (m.embeds ?? []).map((e) => ({ titre: e.title ?? null, texte: e.description ?? null, lien: e.url ?? null })),
    pieces: (m.attachments ?? []).map((a) => ({ nom: a.filename, lien: a.url })),
  };
}

const moi = await appel('/users/@me');
const infos = await appel(`/channels/${salon}`);
const messages = (await appel(`/channels/${salon}/messages?limit=100`)).map(fiche).reverse();

const sortie = path.join(RACINE, 'local', 'discord');
await mkdir(sortie, { recursive: true });
await writeFile(path.join(sortie, 'annonces-brut.json'), JSON.stringify({ releve_le: new Date().toISOString(), robot: moi.username, salon: infos.name, messages }, null, 1));
const recopies = messages.filter((m) => m.recopie);
console.log(`robot : ${moi.username} ; salon : #${infos.name}`);
console.log(`messages : ${messages.length}, dont ${recopies.length} annonce(s) recopiée(s)`);
const vides = recopies.filter((m) => !m.texte && !m.encarts.length).length;
if (vides) console.log(`attention : ${vides} annonce(s) sans texte — vérifier « Message Content Intent » sur la page Bot du portail`);
if (messages.length) console.log(`dernier message : ${messages.at(-1).date} (genre ${messages.at(-1).genre})`);
