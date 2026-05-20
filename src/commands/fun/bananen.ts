import { Command } from '$commands';
import { Banane, bananeStrings, bananeValues } from '@/commands/debug/error.ts';
import { buildEmbed } from '@/lib/embeds/default-embed.ts';

export default new Command(
  'bananen',
  'Zeigt dir deine Bananen an',
  async (interaction) => {
    const id = interaction.user.id;

    const bananen: Record<Banane, number> = store.get(id, 'banane') ?? {};
    const value = Object.entries(bananen).reduce(
      (acc, [key, count]) =>
        acc + (bananeValues[parseInt(key) as Banane] ?? 0) * count,
      0,
    );

    await interaction.reply({
      embeds: [
        await buildEmbed(
          `Bananen von <@${id}>`,
          value == 0 ? 'Dieser Nutzer hat noch keine Bananen gesammelt.' : null,
          Object.entries(bananen).map(([key, count]) => {
            const banane = parseInt(key) as Banane;
            const strings = bananeStrings(banane);
            return [
              `${strings[1]} **${strings[0]}**: ${count}`,
              `${count}x ${strings[1]}`,
            ];
          }),
          value == 0 ? null : `Summe: Wert von **${value}** normalen Bananen`,
        ),
      ],
    });
  },
);
