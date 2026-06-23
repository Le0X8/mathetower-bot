import { Command } from '$commands';
import config from '$config' with { type: 'json' };
import { ApplicationCommandOptionType } from 'discord.js';
import { writeFileSync } from 'node:fs';

export default new Command(
  'zzz-owner-forgetword',
  '[Owner-exclusive] Löscht ein Wort aus der Wordlist',
  async (interaction) => {
    if (interaction.user.id !== config.owner) {
      await interaction.reply({
        content: 'You are not permitted to use this command.',
        ephemeral: true,
      });
      return;
    }

    const word = interaction.options.getString('word', true);

    throw new Error('unimplemented');
  },
  false,
  [
    {
      name: 'word',
      description: 'word',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
);
