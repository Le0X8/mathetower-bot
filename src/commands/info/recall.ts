import { Command } from '$commands';
import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
} from 'discord.js';

async function print(
  interaction: ChatInputCommandInteraction,
  id: string,
  data: { author: string; content: string; date: string; tags: string[] },
  fromPermalink = false,
) {
  const date = new Date(data.date).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const author =
    interaction.guild?.members.cache.get(data.author)?.user.username ??
    'unknown';

  return interaction.reply(
    `-# von @${author}, ${date}\n${data.content}\n-# ` +
      (fromPermalink
        ? `Tags: ${data.tags.map((t: string) => `\`${t}\``).join(', ')}`
        : `Permalink: \`/r ${id}\``),
  );
}

export default new Command(
  'r',
  'Gespeicherte Nachricht',
  async (interaction) => {
    const tags = Array.from(
      new Set(
        interaction.options
          .getString('tags', true)
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
      await interaction.reply({
        content: 'Bitte gib mindestens einen Tag oder eine ID an.',
        ephemeral: true,
      });
      return;
    }

    if (tags.length == 1 && tags[0].includes('-')) {
      const id = tags[0];
      const data = store.get(id, 'recall.content');
      if (!data) {
        await interaction.reply({
          content: `Keine Nachricht unter \`${id}\` gefunden.`,
          ephemeral: true,
        });
        return;
      }

      await print(interaction, id, data, true);
      return;
    }

    let ids = new Set<string>();
    for (let i = 0; i < tags.length; i++) {
      const tag = tags[i];
      const other = store.get(tag, 'recall.tag') ?? [];
      const set = new Set<string>(other);
      ids = i == 0 ? set : ids.intersection(set);
    }

    if (ids.size == 0) {
      await interaction.reply({
        content: `Keine Nachricht gefunden, die in allen Tags \`${tags.join('`, `')}\` vorkommt.`,
        ephemeral: true,
      });
      return;
    }

    if (ids.size == 1) {
      const id = Array.from(ids)[0];
      const data = store.get(id, 'recall.content');
      if (!data) {
        await interaction.reply({
          content: `Keine Nachricht unter \`${id}\` gefunden.`,
          ephemeral: true,
        });
        return;
      }

      await print(interaction, id, data);
      return;
    }

    await interaction.reply(
      `Es wurden mehrere Nachrichten gefunden, die in allen Tags \`${tags.join(
        '`, `',
      )}\` vorkommen: \`${Array.from(ids).join(', ')}\`. Bitte gib eine eindeutige ID an.`,
    );
  },
  false,
  [
    {
      name: 'tags',
      description: 'Tags',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
);
