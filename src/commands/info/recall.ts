import { Command } from '$commands';
import { ApplicationCommandOptionType } from 'discord.js';

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
    ).slice(0, 5);

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

      await interaction.reply(
        `-# <@${data.author}>\n${data.content}\n\n-# Gelistet unter: ${data.tags
          .map((t: string) => `\`${t}\``)
          .join(', ')}\n-# Permalink: \`/r ${id}\``,
      );
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

      await interaction.reply(
        `-# <@${data.author}>\n${data.content}\n\n-# Gelistet unter: ${data.tags
          .map((t: string) => `\`${t}\``)
          .join(', ')}\n-# Permalink: \`/r ${id}\``,
      );
    }

    await interaction.reply(
      `Es wurden mehrere Nachrichten gefunden, die in allen Tags \`${tags.join(
        '`, `',
      )}\` vorkommen. Bitte gib eine eindeutige ID an.`,
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
