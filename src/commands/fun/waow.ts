import { ChatInputCommandInteraction } from 'discord.js';

export default {
  name: 'waow',
  description: 'waow',

  async callback(interaction: ChatInputCommandInteraction) {
    interaction.reply({
      files: [
        {
          attachment: './media/waow-based.png',
          name: 'waow.png',
        },
      ],
    });
  },
};
