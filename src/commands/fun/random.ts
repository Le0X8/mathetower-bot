import { Command } from '$commands';
import { ApplicationCommandOptionType } from 'discord.js';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

export default new Command(
  'random',
  'random halt',
  async (interaction) => {
    let amount = interaction.options.getInteger('amount', false) ?? 1;
    if (amount < 1) amount = Math.floor(Math.random() * 20) + 1;
    amount = Math.min(amount, 50);

    if (!existsSync('./words.json'))
      writeFileSync('./words.json', '{}', 'utf8');
    const wordList: Record<string, number> = JSON.parse(
      readFileSync('./words.json', 'utf8'),
    );
    const words = Object.keys(wordList);

    await interaction.reply(
      Array.from(
        { length: amount },
        () => words[Math.floor(Math.random() * words.length)],
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
