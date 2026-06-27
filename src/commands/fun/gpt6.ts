import { Command } from '$commands';
import { buildEmbed } from '@/lib/embeds/default-embed.ts';
import { ApplicationCommandOptionType } from 'discord.js';

export default new Command(
  'gpt6',
  'wie /random nur noch besser',
  async (interaction) => {
    const start = interaction.options.getString('start', false) ?? '';
    const weights = interaction.options.getBoolean('weights', false) ?? false;
    const out = await globalThis.gpt6((weights ? '\x02' : '') + start);
    if (weights) {
      const lines = out.split('\n');
      await interaction.reply({
        embeds: [
          await buildEmbed(
            'GPT-6 Completion Weights for ' +
              (start.length > 0 ? start : '<START>'),
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
    await interaction.reply((start + ' ' + out).trim().slice(0, 2000));
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
  ],
);
