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

    Object.entries(bananen).forEach(([key]) => {
      if (typeof bananen[parseInt(key) as Banane] != 'number')
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
