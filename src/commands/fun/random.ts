import { Command } from '$commands';
import { ApplicationCommandOptionType } from 'discord.js';

export default new Command(
  'random',
  'wie /gpt6 nur in noch dümmer',
  async (interaction) => {
    let out = await globalThis.gpt6(
      '\x01' + interaction.options.getInteger('count', false),
    );
    await interaction.reply(out.trim().slice(0, 2000));
  },
  false,
  [
    {
      name: 'count',
      description: 'Anzahl der Tokens (0 < count < 256)',
      type: ApplicationCommandOptionType.Integer,
      required: false,
    },
  ],
);
