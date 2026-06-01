import { Command } from '$commands';
import { Banane, bananeStrings, bananeValues } from '@/commands/debug/error.ts';
import { buildEmbed } from '@/lib/embeds/default-embed.ts';
import { amount, nb } from '@/lib/helpers/bananen.ts';
import { ApplicationCommandOptionType } from 'discord.js';
import config from '$config' with { type: 'json' };

export default new Command(
  'bananen',
  'Zeigt dir deine Bananen an',
  async (interaction) => {
    const user = interaction.options.getUser('user', false) || interaction.user;

    const id = user.id;

    if (id == config.uid) {
      const donators: Record<string, number> = store.get('donators') ?? {};
      const total = Object.values(donators).reduce((a, b) => a + b, 0);
      const top = Object.entries(donators).sort(([, a], [, b]) => b - a);
      const plantage: { land: number; multiplier: number } = store.get(
        id,
        'plantage',
      ) ?? { land: 0, multiplier: 1 };

      await interaction.reply({
        embeds: [
          await buildEmbed(
            'Investoren',
            'Insgesamt investiert: ' + nb(total),
            top.map(([key, count], i) => {
              const user = interaction.client.users.cache.get(key);
              const share =
                total > 0 ? ((count / total) * 50).toFixed(2) : '0.00';
              return [
                `**${i + 1}. @${user?.username ?? '#' + key}:** ${share}%`,
                `\`${nb(count)}\` → \`${nb((count / total / 2) * (plantage.land * plantage.multiplier))}\`/min`,
              ];
            }),
            '50% Rest wird für Upgrades verwendet.',
          ),
        ],
      });
      return;
    }

    const bananen: Record<Banane, number> = store.get(id, 'banane') ?? {};
    const value = Object.entries(bananen).reduce(
      (acc, [key, count]) =>
        acc + (bananeValues[parseInt(key) as Banane] ?? 0) * count,
      0,
    );

    Object.entries(bananen).forEach(([key, val]) => {
      const banane = parseInt(key) as Banane;
      const strings = bananeStrings(banane);
      if (typeof strings == 'undefined' || val == 0)
        delete bananen[parseInt(key) as Banane];
    });
    store.set(id, 'banane', bananen);

    await interaction.reply({
      embeds: [
        await buildEmbed(
          `Alle Bananen von @${user.username}`,
          value == 0 ? 'Dieser Nutzer hat noch keine Bananen gesammelt.' : null,
          Object.entries(bananen)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([key, count]) => {
              const banane = parseInt(key) as Banane;
              const strings = bananeStrings(banane);
              return [
                `**${strings[1]} ${strings[0]} Bananen**`,
                `\`${amount(count)}\` Banane${count == 1 ? '' : 'n'} @ \`${nb(bananeValues[banane])}\` = \`${nb(count * bananeValues[banane])}\``,
              ];
            }),
          value == 0
            ? null
            : `Summe: Wert von ${amount(value)} normalen Banane${value == 1 ? '' : 'n'} (\u0e3f)`,
        ),
      ],
    });
  },
  false,
  [
    {
      name: 'user',
      description: 'Wessen Bananen möchtest du sehen?',
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
);
