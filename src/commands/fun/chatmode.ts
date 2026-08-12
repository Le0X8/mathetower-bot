import { Command } from '$commands';
import { models } from '$commands/fun/gpt6.ts';
import { getModel, Model } from '@/lib/helpers/gpt6.ts';
import { ApplicationCommandOptionType, PermissionFlagsBits } from 'discord.js';

export default new Command(
  'chatmode',
  'Aktiviert GPT-6 für den gesamten Channel',
  async (interaction) => {
    if (
      !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)
    ) {
      await interaction.reply({
        content: 'Nur Admins können den Chatmode aktivieren.',
        ephemeral: true,
      });
      return;
    }

    if (interaction.options.getBoolean('disable', false)) {
      store.clear('chatmode+' + interaction.channelId);
      await interaction.reply({
        content: `Chatmode wurde deaktiviert.`,
      });
      return;
    }

    const model = getModel(
      interaction.options.getString('model', false) ?? Model.Gpt7,
    );
    const name = models.find((m) => m.value === model)!.name;

    store.set(interaction.channelId, 'chatmode', model);

    await interaction.reply({
      content: `${name} wurde für <#${interaction.channelId}> aktiviert.`,
    });
  },
  false,
  [
    {
      name: 'model',
      description: 'Modell',
      type: ApplicationCommandOptionType.String,
      choices: models,
      required: false,
    },
    {
      name: 'disable',
      description: 'Deaktiviert den Chatmode',
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
  ],
);
