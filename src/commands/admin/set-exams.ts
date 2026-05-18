import { buildEmbed } from '@/lib/embeds/default-embed.ts';
import { buildErrorEmbed } from '@/lib/embeds/error-embed.ts';
import { formatDate, parseDate } from '@/lib/helpers/date.ts';
import { load, set } from '@/store.ts';
import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  MessageFlags
} from 'discord.js';

const klausurenCommand = {
  name: 'set-exams',
  description: 'Setze die Klausurtermine für ein Modul',
  isAdminCommand: true,
  options: [
    {
      name: 'subject',
      description: 'Das Modul, für das du die Klausurtermine setzen möchtest',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'date1',
      description: 'Erster Klausurtermin (Format: HH:DD.MM.YYYY)',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'date2',
      description: 'Zweiter Klausurtermin (Format: HH:DD.MM.YYYY)',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
  async callback(interaction: ChatInputCommandInteraction) {
    const subject = interaction.options.getString('subject');
    const date1Str = interaction.options.getString('date1');
    const date2Str = interaction.options.getString('date2');

    if (!subject || !date1Str || !date2Str) {
      await interaction.reply({ embeds: [await buildErrorEmbed('Fehlende Eingaben.')], flags: MessageFlags.Ephemeral });
      return;
    }

    const date1 = parseDate(date1Str);
    const date2 = parseDate(date2Str);

    if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
      await interaction.reply({ embeds: [await buildErrorEmbed('Ungültiges Datumsformat. Bitte DD.MM.YYYY verwenden.')], flags: MessageFlags.Ephemeral });
      return;
    }

    set(load(), 'exam+' + subject.toLowerCase(), [
      date1.toISOString(),
      date2.toISOString(),
    ]);

    const embed = await buildEmbed(
      'Klausurtermine gesetzt',
      `Klausur für **${subject.toUpperCase()}** gesetzt auf **${formatDate(date1)}** und **${formatDate(date2)}**.`,
      [], null
    )

    await interaction.reply({ embeds: [embed]  });
  }
}

export default klausurenCommand;