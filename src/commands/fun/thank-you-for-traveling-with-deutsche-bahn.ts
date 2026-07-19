import { buildEmbed } from '@/lib/embeds/default-embed.ts';
import { buildActionFailedEmbed } from '@/lib/embeds/action-failed-embed.ts';
import { getCurrentS1Departures } from '@/lib/helpers/current-s1.ts';
import {
  ChatInputCommandInteraction,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  MessageFlags,
  StringSelectMenuInteraction,
  DiscordjsError,
  DiscordjsErrorCodes,
} from 'discord.js';
import { emojis } from '$emojis';
import { Command } from '$commands';

const CANCELLED_BONUS = 42;

function calculateS(delayMinutes: number): number {
  return Math.round(Math.pow(delayMinutes, 1.4));
}

export default new Command(
  'schnellbahn1',
  'Sammle deine Verspätungen mit der S1!',

  async (interaction: ChatInputCommandInteraction) => {
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

        const description = d.cancelled
          ? `${time
              .split('')
              .map((char) => '\u0336' + char)
              .join('')} Fällt aus`
          : d.delayMinutes > 0
            ? `${time
                .split('')
                .map((char) => '\u0336' + char)
                .join(
                  '',
                )}\u0336\u2007${actualTime}\u2007(+${d.delayMinutes} Min)`
            : time;

        return {
          label,
          description,
          value: d.trainId,
          emoji: emojis.bahn.sbahn,
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
            await buildActionFailedEmbed(
              'Du hast diese Fahrt bereits eingetragen!',
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

      const earnedS = departure.cancelled
        ? CANCELLED_BONUS
        : calculateS(departure.delayMinutes);

      const totalS = updatedTrains
        .map((id) => {
          const d = store.get(id, 's1');
          return d?.cancelled
            ? CANCELLED_BONUS
            : calculateS(d?.delayMinutes ?? 0);
        })
        .reduce((sum, s) => sum + s, 0);

      const earnedDescription = departure.cancelled
        ? `Eine ausgefallene Bahn und bekommt dafür **+${CANCELLED_BONUS} ${emojis.bahn.sbahn}**`
        : `**+${departure.delayMinutes} Minute${departure.delayMinutes == 1 ? '' : 'n'}** und **+${earnedS} ${emojis.bahn.sbahn}** gutgeschrieben bekommen`;

      await collected.reply({
        embeds: [
          await buildEmbed(
            `${emojis.bahn.sbahn} Verspätung eingetragen!`,
            `<@${interaction.user.id}> hat ${earnedDescription} und hat jetzt insgesamt **${totalMinutes} Minute${totalMinutes == 1 ? '' : 'n'}** und **${totalS} ${emojis.bahn.sbahn}**`,
            [
              [
                selectedOption.label.replace('→', 'nach'),
                selectedOption.description +
                  '\n\n-# Thank you for traveling with ' +
                  emojis.bahn.db +
                  '!',
              ],
            ],
            null,
          ),
        ],
      });
      await interaction.deleteReply();
    } catch (error) {
      if (
        (error as DiscordjsError).code ==
        DiscordjsErrorCodes.InteractionCollectorError
      ) {
        await interaction.editReply({
          embeds: [await buildActionFailedEmbed('Dein Arsch war zu langsam!')],
          components: [],
        });
      } else {
        console.error(error);
        await interaction.editReply({
          embeds: [
            await buildActionFailedEmbed(
              'Es ist ein unbekannter Fehler aufgetreten.',
            ),
          ],
          components: [],
        });
      }
    }
  },
);
