import { Command } from '$commands';
import { Mensa } from '@/config/mensa.ts';
import { menuToday } from '@/lib/embeds/menu.ts';
import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
} from 'discord.js';

export default new Command(
  'mensa',
  'Zeigt den Mensaplan',
  async (interaction: ChatInputCommandInteraction) => {
    const mensa = interaction.options.getInteger('mensa') ?? Mensa.Mensa;
    const filter = interaction.options.getInteger('filter') ?? undefined;
    interaction.reply({ embeds: await menuToday(mensa, filter) });
  },
  false,
  [
    {
      name: 'mensa',
      description: 'Für welche Mensa willst du den Plan sehen?',
      type: ApplicationCommandOptionType.Integer,
      choices: [
        { name: 'Mensa', value: Mensa.Mensa },
        { name: 'FoodFakultät', value: Mensa.FoodFak },
        { name: 'Galerie', value: Mensa.Galerie },
        { name: 'alle', value: -1 },
      ],
      required: false,
    },
    {
      name: 'filter',
      description: 'Filtere die angezeigten Gerichte.',
      type: ApplicationCommandOptionType.Integer,
      choices: [
        { name: 'vegan', value: 1 },
        { name: 'vegetarisch', value: 2 },
      ],
      required: false,
    },
  ],
);
