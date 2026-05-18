import { ChatInputCommandInteraction } from 'discord.js';

const waowCommand = {
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

export default waowCommand;
