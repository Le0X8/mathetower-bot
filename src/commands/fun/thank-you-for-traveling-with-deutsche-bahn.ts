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

const CANCELLED_BONUS = 42;
const S_EMOJI = '<:sbahn:1450544266026680463>';

function calculateS(delayMinutes: number): number {
  return Math.round(Math.pow(delayMinutes, 1.4));
}

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
          emoji: S_EMOJI,
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
        ? `Eine ausgefallene Bahn und bekommt dafür **+${CANCELLED_BONUS} ${S_EMOJI}**`
        : `**+${departure.delayMinutes} Minute${departure.delayMinutes == 1 ? '' : 'n'}** und **+${earnedS} ${S_EMOJI}** gutgeschrieben bekommen`;

      await collected.reply({
        embeds: [
          await buildEmbed(
            `${S_EMOJI} Verspätung eingetragen!`,
            `<@${interaction.user.id}> hat ${earnedDescription} und hat jetzt insgesamt **${totalMinutes} Minute${totalMinutes == 1 ? '' : 'n'}** und **${totalS} ${S_EMOJI}**`,
            [
              [
                selectedOption.label.replace('→', 'nach'),
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
};
