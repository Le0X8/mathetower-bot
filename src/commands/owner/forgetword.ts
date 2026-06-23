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

    if (globalThis.wordlist[word]) {
      delete globalThis.wordlist[word];
      writeFileSync(
        './words.json',
        JSON.stringify(globalThis.wordlist),
        'utf8',
      );
      await interaction.reply({
        content: `Das Wort \`${word}\` wurde aus der Wordlist entfernt.`,
      });
    }
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
