import { Command } from '$commands';
import { emojis } from '$emojis';
import { buildEmbed } from '@/lib/embeds/default-embed.ts';

export default new Command(
  'mutation',
  'Bearbeite Bananen mithilfe von Gentechnik!',
  async (interaction) => {
    const prestige = store.get(interaction.user.id, 'prestige') ?? 0;
    const used = store.get(interaction.user.id, 'prestigeused') ?? 0;
    const available = prestige - used;

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
);
