import { Command } from '$commands';
import { ApplicationCommandOptionType } from 'discord.js';

export default new Command(
  'detokenize',
  'Übersetzt einen Input-Tokenstring in Wörter',
  async (interaction) => {
    let content = interaction.options.getString('string', true);

    let out: string[] = content.split(/[^a-z0-9]/).map((token) => {
      if (wordlist.words[token]) {
        return wordlist.words[token];
      }
      return '<unresolvable>';
    });

    await interaction.reply({
      content: out.join(' ').slice(0, 2000) || '<unresolvable>',
      ephemeral: true,
    });
  },
  false,
  [
    {
      name: 'string',
      description: 'Der Tokenstring, der in Wörter übersetzt werden soll',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
);
