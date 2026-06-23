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
  items = items.map(([name, count]) => [name, Math.log2(count + 1)]);
  const total = items.reduce((sum, item) => sum + item[1], 0);
  const rand = Math.random() * total;

  let cumulative = 0;
  for (const item of items) {
    cumulative += item[1];
    if (rand < cumulative) return item[0];
  }
  return null;
}

const showToken = (tk: string) => {
  const word = wordlist.words[tk];
  if (word === '\0') return '<START>';
  return replace(word);
};

export default new Command(
  'gpt6',
  'wie /random nur noch besser',
  async (interaction) => {
    let start = interaction.options.getString('start', false);
    let before: [string, string] = ['0', '0'];
    if (start)
      before = ['\0', '\0', ...start.toLowerCase().split(/[^a-zäöüß]/g)]
        .slice(-2)
        .map((word) => {
          if (wordlist.tokens[word]) {
            return wordlist.tokens[word];
          }
          const id = Object.keys(wordlist.tokens).length.toString(36);
          wordlist.tokens[word] = id;
          wordlist.words[id] = word;
          return id;
        }) as [string, string];
    let next: [string | null, number][] =
      globalThis.wordlist.graph[before.join('+')];

    if (interaction.options.getBoolean('weights', false)) {
      next = [...(next ?? [])];
      next.push(['<RANDOM>', 0.02]);
      next.sort((a, b) => b[1] - a[1]);
      await interaction.reply({
        embeds: [
          await buildEmbed(
            'Weights',
            `Weights for the token \`${before.join('+')}\` (\`${showToken(before[0])} ${showToken(before[1])}\`)`,
            next
              .slice(0, 25)
              .map(([name, value]) => [
                name === null || name === '<RANDOM>'
                  ? (name ?? '<TERMINATE>')
                  : `${name} → ${replace(wordlist.words[name])}`,
                value + ' → ' + Math.log2(value + 1).toFixed(2),
              ]),
            null,
          ),
        ],
      });
      return;
    }

    let arr = [
      replace(wordlist.words[before[0]]),
      replace(wordlist.words[before[1]]),
    ];
    const words = Object.keys(globalThis.wordlist.graph ?? {});

    for (let i = 0; i < 250; i++) {
      next = [...(next ?? [])];
      next.push([
        words[Math.floor(Math.random() * words.length)].split('+')[1],
        0.02,
      ]);
      let word = weightedRandom(next);
      if (word == null) break;
      arr.push(replace(wordlist.words[word]));
      before = [before[1], word];
      next = globalThis.wordlist.graph[before.join('+')];
    }

    let str = arr.join(' ');
    str = str.replaceAll('\0', '').replaceAll('  ', '').trim().slice(0, 2000);

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
