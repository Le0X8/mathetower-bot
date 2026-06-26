import { Command } from '$commands';
import { ApplicationCommandOptionType } from 'discord.js';

export default new Command(
  'gpt6',
  'wie /random nur noch besser',
  async (interaction) => {
    let start = interaction.options.getString('start', false) ?? '';
    let out = start + ' ' + (await globalThis.gpt6(start));
    await interaction.reply(out.trim().slice(0, 2000));
  },
  false,
  [
    {
      name: 'start',
      description: 'Startkontext',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
);
