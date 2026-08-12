import { Command } from '$commands';
import { buildEmbed } from '@/lib/embeds/default-embed.ts';
import { getModel, instructions, Model } from '@/lib/helpers/gpt6.ts';
import { ApplicationCommandOptionType } from 'discord.js';

export const models = [
  { name: 'GPT-6.9 Turbo', value: Model.Gpt69Turbo },
  { name: 'GPT-6', value: Model.Gpt6 },
  { name: 'GPT-7 beta', value: Model.Gpt7 },
];

export default new Command(
  'gpt6',
  'wie /random nur noch besser',
  async (interaction) => {
    const start = interaction.options.getString('start', false) ?? '';
    const weights = interaction.options.getBoolean('weights', false) ?? false;
    const model =
      interaction.options.getString('model', false) ?? Model.Gpt69Turbo;
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
              return [`${start} **${completion[1]}**`.trim(), completion[0]];
            }),
            null,
          ),
        ],
        ephemeral: true,
      });
      return;
    }
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
      choices: models,
    },
  ],
);
