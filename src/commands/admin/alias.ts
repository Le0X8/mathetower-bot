import { Command } from '$commands';
import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';
import config from '$config' with { type: 'json' };

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

    if (
      interaction.guild?.id != config.home_gid ||
      (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator) &&
        interaction.user.id != config.owner_uid)
    ) {
      await interaction.reply({
        content: 'Nur Admins können Aliase entfernen.',
        ephemeral: true,
      });
      return;
    }

    store.clear('recall.alias+' + alias);
    await interaction.reply({
      content: `Alias \`${alias}\` wurde entfernt.`,
    });
  },
  false,
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
