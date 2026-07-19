import { Command } from '$commands';
import { ChatInputCommandInteraction } from 'discord.js';

export default new Command(
  'waow',
  'waow',

  async (interaction: ChatInputCommandInteraction) => {
    interaction.reply({
      files: [
        {
          attachment: './media/waow-based.png',
          name: 'waow.png',
        },
      ],
    });
  },
);
