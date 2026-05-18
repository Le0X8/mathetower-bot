import { ChatInputCommandInteraction } from 'discord.js';
import { help } from '@/lib/embeds/help.ts';

export default {
  name: 'help',
  description: 'Zeigt die Hilfsnachricht an',

  async callback(interaction: ChatInputCommandInteraction) {
    interaction.reply({ embeds: [await help()] });
  },
};
