import { Command } from '$commands';
import { Bananen } from '@/api/bananen.ts';
import { buildEmbed } from '@/lib/embeds/default-embed.ts';
import { amount, nb } from '@/lib/helpers/bananen.ts';
import { ApplicationCommandOptionType } from 'discord.js';

export default new Command(
  'leaderboard',
  'Zeigt die Bananen-Topliste an',
  async (interaction) => {
    const variant =
      interaction.options.getString('leaderboard', false) ?? 'bananen';

    let place: number | null = null;
    switch (variant) {
      case 'prestige':
        const prestige: [string, number][] = store
          .entries('prestige')
          .sort((a, b) => b[1] - a[1]);

        place = prestige.findIndex(([key]) => key == interaction.user.id) + 1;

        await interaction.reply({
          embeds: [
            await buildEmbed(
              'Prestige-Leaderboard',
              'jedes Prestige-Level gibt +200% Bonus',
              prestige.slice(0, 25).map(([key, level], i) => {
                key = key.split('+')[1];
                const user = interaction.guild?.members.cache.get(key);

                return [
                  `**${i + 1}. @${user?.user.username ?? '#' + key}:** Lvl. ${level}`,
                  `\`+${200 * level}%\``,
                ];
              }),
              'Du bist an Platz ' + (place < 0 ? prestige.length + 1 : place),
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

        place = plantage.findIndex(([key]) => key == interaction.user.id) + 1;

        await interaction.reply({
          embeds: [
            await buildEmbed(
              'Plantage-Leaderboard',
              'Land + Multiplier',
              plantage.slice(0, 25).map(([key, score], i) => {
                const user = interaction.guild?.members.cache.get(key);

                return [
                  `**${i + 1}. @${user?.user.username ?? '#' + key}:**`,
                  `\`${amount(score)}\` Upgrades`,
                ];
              }),
              'Du bist an Platz ' + (place < 0 ? plantage.length + 1 : place),
            ),
          ],
        });
        return;

      default:
        const bananen = store
          .entries('banane')
          .map(
            ([key]) =>
              [
                key.split('+')[1],
                new Bananen(key.split('+')[1]).getValue(),
              ] as [string, number],
          )
          .sort((a, b) => b[1] - a[1]);

        place = bananen.findIndex(([key]) => key == interaction.user.id) + 1;

        await interaction.reply({
          embeds: [
            await buildEmbed(
              'Bananen-Leaderboard',
              null,
              bananen.slice(0, 25).map(([key, score], i) => {
                const user = interaction.guild?.members.cache.get(key);

                return [
                  `**${i + 1}. @${user?.user.username ?? '#' + key}:**`,
                  `\`${nb(score)}\``,
                ];
              }),
              'Du bist an Platz ' + (place < 0 ? bananen.length + 1 : place),
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
