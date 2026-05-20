import { Command } from '$commands';
import { Banane, bananeStrings, bananeValues } from '@/commands/debug/error.ts';
import { buildEmbed } from '@/lib/embeds/default-embed.ts';
import { ApplicationCommandOptionType } from 'discord.js';

export default new Command(
  'bananen',
  'Zeigt dir deine Bananen an',
  async (interaction) => {
    const user = interaction.options.getUser('user', false) || interaction.user;

    const id = user.id;

    const bananen: Record<Banane, number> = store.get(id, 'banane') ?? {};
    const value = Object.entries(bananen).reduce(
      (acc, [key, count]) =>
        acc + (bananeValues[parseInt(key) as Banane] ?? 0) * count,
      0,
    );

    await interaction.reply({
      embeds: [
        await buildEmbed(
          `Alle Bananen von @${user.username}`,
          value == 0 ? 'Dieser Nutzer hat noch keine Bananen gesammelt.' : null,
          Object.entries(bananen).map(([key, count]) => {
            const banane = parseInt(key) as Banane;
            const strings = bananeStrings(banane);
            return [
              `${strings[1]} **${strings[0]}** Banane${count == 1 ? '' : 'n'}`,
              `\`${count}x\` Banane${count == 1 ? '' : 'n'} @ \`${bananeValues[banane]}nb\` = \`${count * bananeValues[banane]}nb\``,
            ];
          }),
          value == 0
            ? null
            : `Summe: Wert von ${value} normalen Banane${value == 1 ? '' : 'n'} (nb)`,
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
