import { Command } from '$commands';
import { ApplicationCommandOptionType } from 'discord.js';

export default new Command(
  'forget',
  'Entfernt gespeicherte Nachricht von ihren Tags, sodass nur noch der Permalink funktioniert',
  async (interaction) => {
    const id = interaction.options.getString('id', true).trim().toLowerCase();
    const data = store.get(id, 'recall.content');

    if (!data) {
      await interaction.reply({
        content: `Keine Nachricht mit der ID \`${id}\` gefunden.`,
        ephemeral: true,
      });
      return;
    }

    const tags = data.tags;
    for (const tag of data.tags) {
      const other = store.get(tag, 'recall.tag') ?? [];
      const index = other.indexOf(id);
      if (index > -1) {
        other.splice(index, 1);
        store.set(tag, 'recall.tag', other);
      }
    }

    data.tags = [''];
    store.set(id, 'recall.content', data);
    const tag = store.get('', 'recall.tag') ?? [];
    tag.push(id);
    store.set('', 'recall.tag', tag);

    await interaction.reply(
      `Nachricht mit der ID \`${id}\` wurde von ihren Tags (${tags.map((t: string) => `\`${t}\``).join(', ')}) entfernt.`,
    );
  },
  true,
  [
    {
      name: 'id',
      description: 'id',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
);
