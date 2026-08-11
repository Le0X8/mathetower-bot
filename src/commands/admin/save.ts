import config from '$config' with { type: 'json' };
import { emojis } from '$emojis';
import { Message, PermissionFlagsBits } from 'discord.js';

export async function saveMsg(msg: Message) {
  if (
    ((msg.guild?.id != config.home_gid ||
      !(await msg.member?.fetch())?.permissions.has(
        PermissionFlagsBits.Administrator,
      )) &&
      msg.author.id != config.owner_uid) ||
    !msg.reference
  ) {
    return msg.react(emojis.icon.no);
  }

  const tags = Array.from(
    new Set(
      msg.content
        .replace('!save', '')
        .trim()
        .toLowerCase()
        .split(' ')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
    ),
  ).slice(0, 5);
  if (tags.length == 0) {
    return msg.react(emojis.icon.no);
  }

  const ref = await msg.fetchReference();
  const date = (ref.editedAt ?? ref.createdAt).toISOString();
  const content = ref.content.trim().slice(0, 2000);
  if (!content) {
    return msg.react(emojis.icon.no);
  }
  const author = ref.author.id;

  const other = store.get(tags[0], 'recall.tag') ?? [];
  const id = tags[0] + '-' + (other.length + 1);
  for (const tag of tags) {
    const other = store.get(tag, 'recall.tag') ?? [];
    other.push(id);
    store.set(tag, 'recall.tag', other);
  }
  store.set(id, 'recall.content', { content, author, date, tags });

  msg.reply(
    `Nachricht wurde gespeichert!\n` +
      `Gelistet unter: ${tags.map((t) => `\`${t}\``).join(', ')}\n` +
      `Permalink: \`/r ${id}\``,
  );
}
