import { Command } from '$commands';
import { replace } from '$commands/owner/replacewords.ts';
import { ApplicationCommandOptionType } from 'discord.js';

export default new Command(
  'random',
  'wie /gpt6 nur in noch dümmer',
  async (interaction) => {
    let out = await globalThis.gpt6(
      '\x01' + interaction.options.getInteger('count', false),
    );
    await interaction.reply(replace(out.trim()).slice(0, 2000));
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
