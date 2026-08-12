import { Command } from '$commands';
import { replace } from '$commands/owner/replacewords.ts';
import { buildEmbed } from '@/lib/embeds/default-embed.ts';
import { getModel, instructions, Model } from '@/lib/helpers/gpt6.ts';
import { ApplicationCommandOptionType } from 'discord.js';

export default new Command(
  'gpt6',
  'wie /random nur noch besser',
  async (interaction) => {
    const start = interaction.options.getString('start', false) ?? '';
    const weights = interaction.options.getBoolean('weights', false) ?? false;
    const model = interaction.options.getString('model', false) ?? Model.Gpt7;
    const out = await globalThis.gpt6(
      weights
        ? instructions.weights(getModel(model), start)
        : instructions.prompt(getModel(model), start),
    );
    if (weights) {
      const lines = out.split('\n');
      await interaction.reply({
        embeds: [
          await buildEmbed(
            'Completion Weights for ' + (start.length > 0 ? start : '<START>'),
            lines[0],
            lines.slice(1).map((line) => {
              const completion = line.split(': ');
              return [
                replace(`${start} **${completion[1]}**`.trim()),
                completion[0],
              ];
            }),
            null,
          ),
        ],
        ephemeral: true,
      });
      return;
    }
    await interaction.reply(replace((start + ' ' + out).trim()).slice(0, 2000));
  },
  false,
  [
    {
      name: 'start',
      description: 'Startkontext',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: 'weights',
      description: 'Zeige die 25 wahrscheinlichsten nächsten Tokens',
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
    {
      name: 'model',
      description: 'Modell',
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: [
        { name: 'GPT-7', value: Model.Gpt7 },
        { name: 'GPT-6', value: Model.Gpt6 },
        { name: 'GPT-8 beta', value: Model.Gpt8 },
      ],
    },
  ],
);
