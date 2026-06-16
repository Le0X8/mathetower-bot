import { Command } from '$commands';
import { Banane, bananeValues } from '@/commands/debug/error.ts';
import { buildEmbed } from '@/lib/embeds/default-embed.ts';
import { nb } from '@/lib/helpers/bananen.ts';
import { ApplicationCommandOptionType } from 'discord.js';

export default new Command(
  'leaderboard',
  'Zeigt die Bananen-Topliste an',
  async (interaction) => {
    const variant =
      interaction.options.getString('leaderboard', false) ?? 'bananen';

    switch (variant) {
      case 'prestige':
        const prestige: [string, number][] = store
          .entries('prestige')
          .sort((a, b) => b[1] - a[1]);
        await interaction.reply({
          embeds: [
            await buildEmbed(
              'Prestige-Leaderboard',
              'jedes Prestige-Level gibt +200% Bonus',
              prestige.map(([key, level], i) => {
                key = key.split('+')[1];
                const user = interaction.guild?.members.cache.get(key);

                return [
                  `**${i + 1}. @${user?.user.username ?? '#' + key}:** Lvl. ${level}`,
                  `\`+${200 * level}\`%`,
                ];
              }),
              '',
            ),
          ],
        });
        return;
      case 'plantage':
        const plantage = store
          .entries('plantage')
          .map(
            ([key, value]: [string, { land: number; multiplier: number }]) =>
              [key.split('+')[1], value.land + value.multiplier] as [
                string,
                number,
              ],
          )
          .sort((a, b) => b[1] - a[1]);
        await interaction.reply({
          embeds: [
            await buildEmbed(
              'Plantage-Leaderboard',
              'Land + Multiplier',
              plantage.map(([key, score], i) => {
                const user = interaction.guild?.members.cache.get(key);

                return [
                  `**${i + 1}. @${user?.user.username ?? '#' + key}:**`,
                  `\`${score}\` Upgrades`,
                ];
              }),
              '',
            ),
          ],
        });
        return;

      default:
        const bananen = store
          .entries('banane')
          .map(
            ([key, banane]) =>
              [
                key.split('+')[1],
                Object.entries(banane).reduce(
                  (acc, [key, count]) =>
                    acc +
                    (bananeValues[parseInt(key) as Banane] ?? 0) *
                      (count as number),
                  0,
                ),
              ] as [string, number],
          )
          .sort((a, b) => b[1] - a[1]);
        await interaction.reply({
          embeds: [
            await buildEmbed(
              'Bananen-Leaderboard',
              null,
              bananen.map(([key, score], i) => {
                const user = interaction.guild?.members.cache.get(key);

                return [
                  `**${i + 1}. @${user?.user.username ?? '#' + key}:**`,
                  `\`${nb(score)}\` Bananen`,
                ];
              }),
              '',
            ),
          ],
        });
    }
  },
  false,
  [
    {
      name: 'leaderboard',
      description: 'Leaderboard-Typ',
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: [
        {
          name: 'Bananen (default)',
          value: 'bananen',
        },
        {
          name: 'Plantage',
          value: 'plantage',
        },
        {
          name: 'Prestige',
          value: 'prestige',
        },
      ],
    },
  ],
);
