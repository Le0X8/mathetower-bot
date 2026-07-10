import { Command } from '$commands';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export default new Command(
  'bugreport',
  'Melde einen Fehler an die Entwickler',
  async (interaction) => {
    await interaction.reply({
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
          new ButtonBuilder()
            .setLabel('Fehler melden 🪲')
            .setStyle(ButtonStyle.Link)
            .setURL('https://github.com/Le0X8/mathetower-bot/issues/new'),
        ),
      ],
    });
  },
);
