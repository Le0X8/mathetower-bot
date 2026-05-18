import { help } from '@/lib/embeds/help.ts';
import { Command } from '$commands';

export default new Command(
  'help',
  'Zeigt die Hilfsnachricht an',
  async (interaction) => {
    interaction.reply({ embeds: [await help()] });
  },
);
