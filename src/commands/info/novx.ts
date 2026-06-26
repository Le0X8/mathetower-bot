import { Command } from '$commands';
import { ApplicationCommandOptionType } from 'discord.js';

export default new Command(
  'novx',
  'Deaktiviert die automatische Ersetzung von Links in Nachrichten.',
  async (interaction) => {
    const novx = interaction.options.getBoolean('novx', true);
    store.set(interaction.user.id, 'novx', novx);
    await interaction.reply({
      content: `Automatische Link-Ersetzung ist jetzt ${
        novx ? 'deaktiviert' : 'aktiviert'
      }.`,
      ephemeral: true,
    });
  },
  false,
  [
    {
      name: 'novx',
      description:
        'Deaktiviert die automatische Ersetzung von Links in Nachrichten.',
      type: ApplicationCommandOptionType.Boolean,
      required: true,
    },
  ],
);
