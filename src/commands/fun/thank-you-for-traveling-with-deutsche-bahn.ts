import { buildEmbed } from '@/lib/embeds/default-embed.ts';
import { buildErrorEmbed } from '@/lib/embeds/error-embed.ts';
import { getCurrentS1Departures } from '@/lib/helpers/current-s1.ts';
import {
  ChatInputCommandInteraction,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  MessageFlags,
  StringSelectMenuInteraction,
} from 'discord.js';

export default {
  name: 'schnellbahn1',
  description: 'Sammle deine Verspätungen mit der S1!',

  async callback(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      const departures = await getCurrentS1Departures();

      const selectOptions = departures.map((d) => {
        const time = new Intl.DateTimeFormat('de-DE', {
          timeZone: 'Europe/Berlin',
          hour: '2-digit',
          minute: '2-digit',
          hourCycle: 'h23',
        }).format(d.plannedDeparture);

        const actualTime = new Intl.DateTimeFormat('de-DE', {
          timeZone: 'Europe/Berlin',
          hour: '2-digit',
          minute: '2-digit',
          hourCycle: 'h23',
        }).format(d.actualDeparture);

        const label = `S1 → ${d.direction ?? ''}`.trim();

        const description =
          d.delayMinutes > 0
            ? `${time
                .split('')
                .map((char) => '\u0336' + char)
                .join(
                  '',
                )}\u0336\u2007 →\u2007${actualTime}\u2007(+${d.delayMinutes} Min)`
            : time;

        return {
          label,
          description,
          value: d.trainId,
          emoji: '<:sbahn:1450544266026680463>',
        };
      });

      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('s1_select')
        .setPlaceholder('S1 auswählen')
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(selectOptions);

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        selectMenu,
      );

      await interaction.editReply({
        content: 'Wähle deine S1 aus:',
        components: [row],
      });

      const collected = (await interaction.channel?.awaitMessageComponent({
        filter: (i) => i.customId === 's1_select' && i.isStringSelectMenu(),
        time: 60000,
      })) as StringSelectMenuInteraction | null;

      if (!collected) return;
      const selected = collected.values[0];

      const departure = departures.find((d) => d.trainId === selected)!;
      const { trainId, ...departureData } = departure;
      const selectedOption = selectOptions.find((o) => o.value === selected)!;

      const previous: string[] =
        store.get(interaction.user.id, 's1-trains') ?? [];

      if (previous.includes(trainId)) {
        await interaction.editReply({
          embeds: [
            await buildErrorEmbed(
              new Error('Du hast diese Fahrt bereits eingetragen!'),
            ),
          ],
          components: [],
        });
        return;
      }

      const updatedTrains = [...previous, trainId];

      store.set(interaction.user.id, 's1-trains', updatedTrains);
      store.set(trainId, 's1', departureData);

      const totalMinutes = updatedTrains
        .map((id) => store.get(id, 's1')?.delayMinutes ?? 0)
        .reduce((sum, m) => sum + m, 0);

      await collected.reply({
        embeds: [
          await buildEmbed(
            '<:sbahn:1450544266026680463> Verspätung eingetragen!',
            `Du hast **+${departure.delayMinutes} Minute${departure.delayMinutes == 1 ? '' : 'n'}** gutgeschrieben 
            bekommen und hast jetzt insgesamt **${totalMinutes} Minute${totalMinutes == 1 ? '' : 'n'}**`,
            [
              [
                selectedOption.label,
                selectedOption.description +
                  '\n\n-# Thank you for traveling with <:db:1451139399478939660>!',
              ],
            ],
            null,
          ),
        ],
      });
      await interaction.deleteReply();
    } catch (error) {
      await interaction.editReply({
        embeds: [
          await buildErrorEmbed(
            error instanceof Error ? error : new Error(String(error)),
          ),
        ],
        components: [],
      });
    }
  },
};
