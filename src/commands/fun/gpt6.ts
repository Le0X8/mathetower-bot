import { Command } from '$commands';
import { ApplicationCommandOptionType } from 'discord.js';

function replace(word: string): string {
  if (store.get('replacements')?.[word]) {
    return store.get('replacements')[word];
  }
  return word;
}

function weightedRandom(items: [string | null, number][]): string | null {
  const total = items.reduce((sum, item) => sum + item[1], 0);
  const rand = Math.random() * total;

  let cumulative = 0;
  for (const item of items) {
    cumulative += item[1];
    if (rand < cumulative) return item[0];
  }
  return null;
}

export default new Command(
  'gpt6',
  'wie /random nur noch besser',
  async (interaction) => {
    const words = Object.keys(globalThis.wordlist);

    let word: string | null =
      interaction.options.getString('start', false) ??
      words[Math.floor(Math.random() * words.length)];
    let next = globalThis.wordlist[word];
    let arr = [replace(word)];

    for (let i = 0; i < 100; i++) {
      word = weightedRandom(next ?? []);
      if (word == null) break;
      arr.push(replace(word));
      next = globalThis.wordlist[word];
    }

    let str = arr.join(' ').slice(0, 2000);

    const replacements: Record<string, string> =
      store.get('replacements2') ?? {};
    Object.entries(replacements).forEach(([key, value]) => {
      str = str.replaceAll(key, value);
    });

    await interaction.reply(str.slice(0, 2000));
  },
  false,
  [
    {
      name: 'start',
      description: 'Startwort',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
);
