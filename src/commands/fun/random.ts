import { Command } from '$commands';
import { ApplicationCommandOptionType } from 'discord.js';

function replace(word: string): string {
  if (store.get('replacements')?.[word]) {
    return store.get('replacements')[word];
  }
  return word;
}

export default new Command(
  'random',
  'random halt',
  async (interaction) => {
    let amount = interaction.options.getInteger('amount', false) ?? 1;
    if (amount < 1) amount = Math.floor(Math.random() * 7) + 1;
    amount = Math.min(amount, 100);

    const words = Object.keys(globalThis.wordlist);

    await interaction.reply(
      Array.from({ length: amount }, () =>
        replace(words[Math.floor(Math.random() * words.length)]),
      )
        .join(' ')
        .slice(0, 2000),
    );
  },
  false,
  [
    {
      name: 'amount',
      description: 'Anzahl der Wörter, <1 für random',
      type: ApplicationCommandOptionType.Integer,
      required: false,
    },
  ],
);
