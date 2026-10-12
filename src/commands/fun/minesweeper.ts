import { Command } from '$commands';
import { buildEmbed } from '@/lib/embeds/default-embed.ts';
import { ApplicationCommandOptionType } from 'discord.js';

const presets: Record<
  string,
  { width: number; height: number; mines: number }
> = {
  easy: { width: 8, height: 8, mines: 10 },
  medium: { width: 16, height: 16, mines: 40 },
};

export default new Command(
  'minesweeper',
  'generiert ein Minesweeper-Feld',
  async (interaction) => {
    const preset = interaction.options.getString('preset', false) ?? 'medium';
    let { width, height, mines } = presets[preset] ?? presets['medium'];

    width = Math.min(Math.max(width, 1), 16);
    height = Math.min(Math.max(height, 1), 25);
    mines = Math.min(Math.max(mines, 1), width * height - 1);

    let minesLeft = mines;
    const field: string[][] = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => '⬜'),
    );

    while (minesLeft > 0) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      if (field[y][x] === '⬜') {
        field[y][x] = '💣';
        minesLeft--;
      }
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (field[y][x] === '💣') continue;
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (
              y + dy >= 0 &&
              y + dy < height &&
              x + dx >= 0 &&
              x + dx < width &&
              field[y + dy][x + dx] === '💣'
            ) {
              count++;
            }
          }
        }
        field[y][x] = count > 0 ? `:${count}:` : '⬜';
      }
    }

    const message = field
      .map((row) => row.map((char) => `||${char}||`).join(''))
      .join('\n');
    await interaction.reply(message);
  },
  false,
  [
    {
      name: 'preset',
      description: 'Vordefinierte Art des Spielfeldes',
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: [
        {
          name: 'Einfach (8x8, 10 Mines)',
          value: 'easy',
        },
        {
          name: 'Mittel (16x16, 40 Mines)',
          value: 'medium',
        },
      ],
    },
  ],
);
