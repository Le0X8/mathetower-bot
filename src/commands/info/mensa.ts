import { MENSA_IDS } from '@/config/mensa.ts';
import { menuToday } from '@/lib/embeds/menu.ts';
import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
} from 'discord.js';

const mensaCommand = {
  name: 'mensa',
  description: 'Zeigt den Mensaplan',
  options: [
    {
      name: 'mensa',
      description: 'Für welche Mensa willst du den Plan sehen?',
      type: ApplicationCommandOptionType.Integer,
      choices: [
        { name: 'Mensa', value: MENSA_IDS.MENSA },
        { name: 'FoodFakultät', value: MENSA_IDS.FOODFAK },
        { name: 'Galerie', value: MENSA_IDS.GALERIE },
        { name: 'Alle', value: -1 },
      ],
      required: false,
    },
    {
      name: 'filter',
      description: 'Filtere die angezeigten Gerichte.',
      type: ApplicationCommandOptionType.Integer,
      choices: [
        { name: 'Vegan', value: 1 },
        { name: 'Vegetarisch', value: 2 },
      ],
      required: false,
    },
  ],

  async callback(interaction: ChatInputCommandInteraction) {
    const mensa = interaction.options.getInteger('mensa') ?? MENSA_IDS.MENSA;
    const filter = interaction.options.getInteger('filter') ?? undefined;
    interaction.reply({ embeds: await menuToday(mensa, filter) });
  },
};

export default mensaCommand;
