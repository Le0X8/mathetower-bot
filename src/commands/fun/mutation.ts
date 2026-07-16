import { Command } from '$commands';
import { emojis } from '$emojis';
import { buildEmbed } from '@/lib/embeds/default-embed.ts';
import { nb } from '@/lib/helpers/bananen.ts';
import { ApplicationCommandOptionType } from 'discord.js';

function gaussianRandom(mean: number, stdDev: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return Math.round(mean + z * stdDev);
}

function bellRandom(): number {
  const value = gaussianRandom(0, 3.3);
  return Math.max(-10, Math.min(10, value));
}

export interface MutatedBanane {
  types: [boolean, boolean, boolean];
  ranges: [number, number, number];
}

enum Traits {
  Resistenz,
  Geschwindigkeit,
  Einfachheit,
  Investment,
  Resistenz2,
  Seltenheit,
}

interface MutationInfo {
  g1: Traits;
  g2: Traits;
  g3: Traits;
  r1: number;
  r2: number;
  r3: number;
}

function getMutationInfo(mutation: MutatedBanane): MutationInfo {
  return {
    g1: mutation.types[0] ? Traits.Geschwindigkeit : Traits.Resistenz,
    g2: mutation.types[1] ? Traits.Investment : Traits.Einfachheit,
    g3: mutation.types[2] ? Traits.Seltenheit : Traits.Resistenz2,
    r1: mutation.ranges[0],
    r2: mutation.ranges[1],
    r3: mutation.ranges[2],
  };
}

export function getId(mutation: MutatedBanane): string {
  if (!mutation || !mutation.types || !mutation.ranges) return '0-000';
  return (
    String.fromCharCode(
      0x41 +
        (mutation.types[0] ? 1 : 0) +
        (mutation.types[1] ? 2 : 0) +
        (mutation.types[2] ? 4 : 0),
    ) +
    '-' +
    String.fromCharCode(0x4b - mutation.ranges[0]) +
    String.fromCharCode(0x4b - mutation.ranges[1]) +
    String.fromCharCode(0x4b - mutation.ranges[2])
  );
}

export function fromId(id: string): MutatedBanane {
  id = id.toUpperCase();
  if (!/^[A-G]-[A-K]{3}$/.test(id)) throw new Error('Invalid ID');
  const types = [
    (id.charCodeAt(0) - 0x41) & 1 ? true : false,
    (id.charCodeAt(0) - 0x41) & 2 ? true : false,
    (id.charCodeAt(0) - 0x41) & 4 ? true : false,
  ];
  const ranges = [
    0x4b - id.charCodeAt(2),
    0x4b - id.charCodeAt(3),
    0x4b - id.charCodeAt(4),
  ];
  return { types, ranges } as MutatedBanane;
}

function realValue(value: number): number {
  return value > 0 ? value ** 10 + 1 : 1 / (-value + 1);
}

export function getValue(mutation: MutatedBanane): number {
  return (
    realValue(mutation.ranges[0]) *
    realValue(mutation.ranges[1]) *
    realValue(mutation.ranges[2])
  );
}

function getRange(num: number): string {
  return ' `[' + '█'.repeat(num + 10) + '░'.repeat(20 - (num + 10)) + ']` ';
}

function percent(num: number): string {
  return (num < 0 ? '' : '+') + num + '%';
}

function getStrongestTrait(info: MutationInfo): [Traits, number] {
  const traits = [
    { trait: info.g1, value: info.r1 },
    { trait: info.g2, value: info.r2 },
    { trait: info.g3, value: info.r3 },
  ];
  traits.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  return [traits[0].trait, traits[0].value];
}

function getEmoji([trait, strength]: [Traits, number]): string {
  const positive = strength > 0;
  switch (trait) {
    case Traits.Resistenz:
      return positive ? emojis.banane.gestählt : emojis.banane.braun;
    case Traits.Geschwindigkeit:
      return positive ? emojis.banane.schnellwachsend : emojis.banane.langsam;
    case Traits.Einfachheit:
      return positive ? emojis.banane.einfach : emojis.banane.komplex;
    case Traits.Investment:
      return positive ? emojis.banane.investment : emojis.banane.besteuert;
    case Traits.Resistenz2:
      return positive ? emojis.banane.gestählt : emojis.banane.braun;
    case Traits.Seltenheit:
      return positive ? emojis.banane.selten : emojis.banane.schlecht;
  }
}

export function aboutBanane(mutation: MutatedBanane, num?: number) {
  const info = getMutationInfo(mutation);
  const id = getId(mutation);
  const strongestTrait = getStrongestTrait(info);
  const emoji = getEmoji(strongestTrait);
  return buildEmbed(
    'Mutierte Banane #' + id + ' ' + emoji,
    `Wert: \`${nb(getValue(mutation))}\``,
    [
      info.g1 === Traits.Resistenz
        ? [
            '**Gen 1: Resistenz** ' +
              percent(info.r1 * 4.5) +
              ' weniger Infektionen',
            emojis.banane.braun + getRange(info.r1) + emojis.banane.gestählt,
          ]
        : [
            '**Gen 1: Wachstumsgeschwindigkeit** ' +
              percent(info.r1 * 5) +
              ' schnelleres Wachstum',
            emojis.banane.langsam +
              getRange(info.r1) +
              emojis.banane.schnellwachsend,
          ],
      info.g2 === Traits.Einfachheit
        ? [
            '**Gen 2: Einfachheit** ' +
              percent(info.r2 * 2) +
              ' billigere Upgrades',
            emojis.banane.komplex + getRange(info.r2) + emojis.banane.einfach,
          ]
        : [
            '**Gen 2: Investment** ' +
              percent(info.r2 * 5) +
              ' Chance auf 19% Rückgabe bei `/gift`',
            emojis.banane.besteuert +
              getRange(info.r2) +
              emojis.banane.investment,
          ],
      info.g3 === Traits.Resistenz2
        ? [
            '**Gen 3: Resistenz** ' +
              percent(info.r3 * 4.5) +
              ' weniger Infektionen',
            emojis.banane.braun + getRange(info.r3) + emojis.banane.gestählt,
          ]
        : [
            '**Gen 3: Seltenheit** ' +
              percent(info.r3 * 5) +
              ' höherer Preis für Bananen',
            emojis.banane.schlecht + getRange(info.r3) + emojis.banane.selten,
          ],
    ],
    typeof num === 'undefined'
      ? null
      : num != 0
        ? 'Nutze `/plantage use:' +
          num +
          '` um diese Banane auf deiner Plantage anzubauen.'
        : 'Nutze `/plantage use:0` um die aktuell aktive Banane zu deaktivieren.',
  );
}

export interface Buffs {
  infection: number;
  speed: number;
  simplicity: number;
  investment: number;
  rarity: number;
}

export function getMutation(uid: string): Buffs {
  const active = store.get(uid, 'mutationactive') ?? null;
  if (!active || typeof active === 'number')
    return {
      infection: 0,
      speed: 0,
      simplicity: 0,
      investment: 0,
      rarity: 0,
    };
  const mutation = active;
  const info = getMutationInfo(mutation);
  return {
    infection:
      (info.g1 === Traits.Resistenz ? info.r1 * 4.5 : 0) +
      (info.g3 === Traits.Resistenz2 ? info.r3 * 4.5 : 0),
    speed: info.g1 === Traits.Geschwindigkeit ? info.r1 * 5 : 0,
    simplicity: info.g2 === Traits.Einfachheit ? info.r2 * 2 : 0,
    investment: info.g2 === Traits.Investment ? info.r2 * 5 : 0,
    rarity: info.g3 === Traits.Seltenheit ? info.r3 * 5 : 0,
  };
}

export function setMutation(uid: string, id: number | null) {
  if (id === 0) {
    store.set(uid, 'mutationactive', null);
    return true;
  }
  const mutations = store.get(uid, 'mutated') ?? [];
  if (id !== null && (id < 1 || id > mutations.length)) return false;
  if (
    id !== null &&
    getId(store.get(uid, 'mutationactive')) === getId(mutations[id - 1])
  )
    return false;
  store.set(uid, 'mutationactive', id === null ? null : mutations[id - 1]);
  return true;
}

function randomBetween(a: number, b: number): number {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default new Command(
  'mutation',
  'Bearbeite Bananen mithilfe von Gentechnik!',
  async (interaction) => {
    const prestige = store.get(interaction.user.id, 'prestige') ?? 0;
    const used = store.get(interaction.user.id, 'prestigeused') ?? 0;
    const mutated: MutatedBanane[] =
      store.get(
        interaction.options.getUser('inventory', false)?.id ??
          interaction.user.id,
        'mutated',
      ) ?? [];
    const available = prestige - used;

    if (interaction.options.getUser('inventory', false)) {
      if (mutated.length === 0) {
        await interaction.reply('Du hast noch keine Bananen mutiert!');
        return;
      }

      const bananen = mutated
        .slice(0, 25)
        .map((mutation, index): [string, string] => {
          const info = getMutationInfo(mutation);
          const id = getId(mutation);
          const strongestTrait = getStrongestTrait(info);
          const emoji = getEmoji(strongestTrait);

          return [
            `**Mutierte Banane ${index + 1}**`,
            `${id} ${emoji} ${strongestTrait[1]} • \`${nb(getValue(mutation))}\``,
          ];
        });

      await interaction.reply({
        embeds: [
          await buildEmbed(
            'Mutierte Bananen',
            'Weitere Details: `/mutation info:<Nummer>`',
            bananen,
            mutated.length > 25 ? `+${mutated.length - 25} weitere` : null,
          ),
        ],
      });
    }

    // only add new methods after this comment!

    if (
      interaction.options.getInteger('merge', false) &&
      interaction.options.getInteger('merge2', false)
    ) {
      const id1 = interaction.options.getInteger('merge', true);
      const id2 = interaction.options.getInteger('merge2', true);

      if (id1 < 1 || id1 > mutated.length || id2 < 1 || id2 > mutated.length) {
        await interaction.reply({
          content: `Du hast keine mutierte Banane mit der Nummer \`${id1}\` oder \`${id2}\`!`,
          ephemeral: true,
        });
        return;
      }

      if (id1 === id2) {
        await interaction.reply({
          content: `Du kannst nicht die gleiche Banane zusammenführen!`,
          ephemeral: true,
        });
        return;
      }

      const mutation1 = mutated[id1 - 1];
      mutated.splice(id1 - 1, 1);
      const mutation2 = mutated[id2 < id1 ? id2 - 1 : id2 - 2];
      mutated.splice(id2 < id1 ? id2 - 1 : id2 - 2, 1);

      const newMutation: MutatedBanane = {
        types: [
          Math.random() < 0.1
            ? Math.random() < 0.5
              ? mutation1.types[0]
              : mutation2.types[0]
            : Math.random() < 0.5,
          Math.random() < 0.1
            ? Math.random() < 0.5
              ? mutation1.types[1]
              : mutation2.types[1]
            : Math.random() < 0.5,
          Math.random() < 0.1
            ? Math.random() < 0.5
              ? mutation1.types[1]
              : mutation2.types[1]
            : Math.random() < 0.5,
        ],
        ranges: [
          Math.random() < 0.1
            ? bellRandom()
            : randomBetween(
                Math.max(mutation1.ranges[0] - 2, -10),
                Math.min(mutation2.ranges[0] + 5, 10),
              ),
          Math.random() < 0.1
            ? bellRandom()
            : randomBetween(
                Math.max(mutation1.ranges[1] - 2, -10),
                Math.min(mutation2.ranges[1] + 5, 10),
              ),
          Math.random() < 0.1
            ? bellRandom()
            : randomBetween(
                Math.max(mutation1.ranges[2] - 2, -10),
                Math.min(mutation2.ranges[2] + 5, 10),
              ),
        ],
      };

      mutated.push(newMutation);
      store.set(interaction.user.id, 'mutated', mutated);

      await interaction.reply({
        embeds: [await aboutBanane(newMutation, mutated.length)],
      });
      return;
    }

    if (interaction.options.getInteger('info', false) !== null) {
      const id = interaction.options.getInteger('info', true);
      if (id < 0 || id > mutated.length) {
        await interaction.reply({
          content: `Du hast keine mutierte Banane mit der Nummer \`${id}\`!`,
          ephemeral: true,
        });
        return;
      }
      const mutation =
        id === 0
          ? (store.get(interaction.user.id, 'mutationactive') ?? null)
          : mutated[id - 1];
      if (!mutation) {
        await interaction.reply({
          content: `Du hast keine Banane aktiviert!`,
          ephemeral: true,
        });
        return;
      }
      await interaction.reply({
        embeds: [await aboutBanane(mutation, id)],
      });
      return;
    }

    if (interaction.options.getBoolean('mutate', false)) {
      if (available <= 0) {
        await interaction.reply(
          'Du hast keine Prestige-Punkte übrig, um Bananen zu mutieren!',
        );
        return;
      }

      store.set(interaction.user.id, 'prestigeused', used + 1);
      const mutation: MutatedBanane = {
        types: [Math.random() < 0.5, Math.random() < 0.5, Math.random() < 0.5],
        ranges: [bellRandom(), bellRandom(), bellRandom()],
      };
      mutated.push(mutation);
      store.set(interaction.user.id, 'mutated', mutated);

      await interaction.reply({
        embeds: [await aboutBanane(mutation, mutated.length)],
      });
      return;
    }

    await interaction.reply({
      embeds: [
        await buildEmbed(
          'Mutation',
          available +
            ' mutierbare Bananen ' +
            emojis.banane.mutierbar +
            ' verfügbar',
          [],
          null,
        ),
      ],
    });
  },
  false,
  [
    {
      name: 'mutate',
      description: 'Mutiere eine Banane!',
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
    {
      name: 'inventory',
      description: 'Zeige deine ersten 25 Bananen im Inventar an!',
      type: ApplicationCommandOptionType.User,
      required: false,
    },
    {
      name: 'info',
      description: 'Zeige Informationen zu einer mutierten Banane an!',
      type: ApplicationCommandOptionType.Integer,
      required: false,
    },
    {
      name: 'merge',
      description: 'Führe zwei Bananen zusammen, um eine neue zu erhalten!',
      type: ApplicationCommandOptionType.Integer,
      required: false,
    },
    {
      name: 'merge2',
      description: 'Wähle die zweite Banane für die Mutation aus!',
      type: ApplicationCommandOptionType.Integer,
      required: false,
    },
  ],
);
