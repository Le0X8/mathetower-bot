import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction
} from 'discord.js';
import { examGet, examList } from '@/lib/embeds/exam.ts';

const klausurenCommand = {
  name: 'klausuren',
  description: 'Zeigt die Klausurtermine von einem Modul',
  options: [
    {
      name: 'subject',
      description: 'Das Modul, für das du die Klausurtermine wissen möchtest',
      type: ApplicationCommandOptionType.String,
      required: false,
    }
  ],

  async callback(
    interaction: ChatInputCommandInteraction
  ) {
    let subject = interaction.options.getString('subject');
    if (subject) {
      interaction.reply({ embeds: [await examGet(subject)] });
    } else {
      interaction.reply({ embeds: [await examList()] });
    }
  }
}

export default klausurenCommand;
