import { Command } from '$commands';
import { buildEmbed } from '@/lib/embeds/default-embed.ts';
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
    if (rand < cumulative) return item[0] == '>' ? null : item[0];
  }
  return null;
}

export default new Command(
  'gpt6',
  'wie /random nur noch besser',
  async (interaction) => {
    let word: string | null =
      interaction.options.getString('start', false) ?? '>';
    word = word.toLowerCase().split(/[^a-zäöüß]/g)[0];
    let next = globalThis.wordlist[word];
    if (interaction.options.getBoolean('weights', false)) {
      if (word === '>') word = '<START>';
      next = [...(next ?? [])];
      next.push(['<RANDOM>', 1]);
      next.sort((a, b) => b[1] - a[1]);
      await interaction.reply({
        embeds: [
          await buildEmbed(
            'Weights',
            `Weights for the word \`${word}\``,
            next
              .slice(0, 25)
              .map(([name, value]) => [
                name ?? '<TERMINATE>',
                value.toString(),
              ]),
            null,
          ),
        ],
      });
      return;
    }

    let arr = [replace(word)];
    const words = Object.keys(globalThis.wordlist ?? {});

    for (let i = 0; i < 250; i++) {
      next = [...(next ?? [])];
      next.push([words[Math.random() * words.length], 1]);
      word = weightedRandom(next);
      if (i == 0 && word == null)
        word = words[Math.floor(Math.random() * words.length)];
      if (word == null) break;
      arr.push(replace(word));
      next = globalThis.wordlist[word];
    }

    let str = arr.join(' ').slice(0, 2000);
    if (str.startsWith('>')) str = str.slice(1);

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
    {
      name: 'weights',
      description: 'Zeige Gewichtungen',
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
  ],
);
