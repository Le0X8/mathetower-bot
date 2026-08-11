import { Command } from '$commands';
import { ApplicationCommandOptionType } from 'discord.js';

export default new Command(
  'alias',
  'Erstellt einen Alias für einen Tag',
  async (interaction) => {
    const alias = interaction.options
      .getString('alias', true)
      .split(' ')[0]
      .trim()
      .toLowerCase();
    const tag = interaction.options
      .getString('tag', false)
      ?.split(' ')[0]
      .trim()
      .toLowerCase();

    if (alias == tag) {
      await interaction.reply({
        content: 'Alias und Tag dürfen nicht gleich sein.',
        ephemeral: true,
      });
      return;
    }

    if (store.get(alias, 'recall.tag')) {
      await interaction.reply({
        content: `Alias \`${alias}\` existiert bereits als Tag.`,
        ephemeral: true,
      });
      return;
    }

    if (tag) {
      store.set(alias, 'recall.alias', tag);

      await interaction.reply({
        content: `Alias \`${alias}\` wurde für Tag \`${tag}\` erstellt.`,
      });
      return;
    }

    store.clear('recall.alias+' + alias);
    await interaction.reply({
      content: `Alias \`${alias}\` wurde entfernt.`,
    });
  },
  true,
  [
    {
      name: 'alias',
      description: 'alias',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'tag',
      description: 'tag',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
);
