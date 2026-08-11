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
  )
    .slice(0, 5)
    .map((tag) => store.get(tag, 'recall.alias') ?? tag);
  if (tags.length == 0) {
    return msg.react(emojis.icon.no);
  }

  const ref = await msg.fetchReference();
  const date = (ref.editedAt ?? ref.createdAt).toISOString();
  let content = ref.content.trim().slice(0, 2000);
  if (ref.attachments.size > 0) {
    content += '\n' + ref.attachments.map((a) => a.url).join('\n');
  }
  if (!content) {
    return msg.react(emojis.icon.no);
  }
  const author = ref.author.id;

  let counter = store.get(tags[0], 'recall.tagcount') ?? 0;
  const id = tags[0] + '-' + ++counter;
  store.set(tags[0], 'recall.tagcount', counter);
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
