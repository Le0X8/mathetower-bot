import { Command } from '$commands';
import { emojis } from '$emojis';
import { buildEmbed } from '@/lib/embeds/default-embed.ts';
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

interface MutatedBanane {
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

function getMutationInfo(mutation: MutatedBanane) {
  return {
    g1: mutation.types[0] ? Traits.Geschwindigkeit : Traits.Resistenz,
    g2: mutation.types[1] ? Traits.Investment : Traits.Einfachheit,
    g3: mutation.types[2] ? Traits.Seltenheit : Traits.Resistenz2,
    r1: mutation.ranges[0],
    r2: mutation.ranges[1],
    r3: mutation.ranges[2],
  };
}

function getId(mutation: MutatedBanane): string {
  return (
    String.fromCharCode(
      0x41 +
        (mutation.types[0] ? 1 : 0) +
        (mutation.types[1] ? 2 : 0) +
        (mutation.types[2] ? 4 : 0),
    ) +
    '-' +
    String.fromCharCode(0x41 + mutation.ranges[0] + 10) +
    String.fromCharCode(0x41 + mutation.ranges[1] + 10) +
    String.fromCharCode(0x41 + mutation.ranges[2] + 10)
  );
}

function getRange(num: number): string {
  return '█'.repeat(num + 10) + '░'.repeat(20 - (num + 10));
}

function percent(num: number): string {
  return (num < 0 ? '' : '+') + num + '%';
}

function aboutBanane(mutation: MutatedBanane) {
  const info = getMutationInfo(mutation);
  const id = getId(mutation);
  return buildEmbed(
    'Mutierte Banane #' + id,
    null,
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
    null,
  );
}

export default new Command(
  'mutation',
  'Bearbeite Bananen mithilfe von Gentechnik!',
  async (interaction) => {
    const prestige = store.get(interaction.user.id, 'prestige') ?? 0;
    const used = store.get(interaction.user.id, 'prestigeused') ?? 0;
    const mutated: MutatedBanane[] =
      store.get(interaction.user.id, 'mutated') ?? [];
    const available = prestige - used;

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
        embeds: [await aboutBanane(mutation)],
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
  ],
);
