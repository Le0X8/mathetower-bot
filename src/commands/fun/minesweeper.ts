import { Command } from '$commands';
import { ApplicationCommandOptionType } from 'discord.js';

const presets: Record<
  string,
  { width: number; height: number; mines: number }
> = {
  easy: { width: 5, height: 5, mines: 2 },
  medium: { width: 8, height: 8, mines: 16 },
  hard: { width: 11, height: 9, mines: 50 },
};

export default new Command(
  'minesweeper',
  'generiert ein Minesweeper-Feld',
  async (interaction) => {
    const preset = interaction.options.getString('preset', false) ?? 'medium';
    let { width, height, mines } = presets[preset] ?? presets['medium'];

    width = interaction.options.getInteger('width', false) ?? width;
    height = interaction.options.getInteger('height', false) ?? height;
    mines = interaction.options.getInteger('mines', false) ?? mines;

    width = Math.min(Math.max(width, 1), 11);
    height = Math.min(Math.max(height, 1), 9);
    mines = Math.min(Math.max(mines, 1), width * height);

    let minesLeft = mines;
    const field: string[][] = Array.from({ length: height }, () =>
      Array.from({ length: width }, () => '||⬜||'),
    );

    while (minesLeft > 0) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      if (field[y][x] === '||⬜||') {
        field[y][x] = '||💣||';
        minesLeft--;
      }
    }

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (field[y][x] === '||💣||') continue;
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (
              y + dy >= 0 &&
              y + dy < height &&
              x + dx >= 0 &&
              x + dx < width &&
              field[y + dy][x + dx] === '||💣||'
            ) {
              count++;
            }
          }
        }
        field[y][x] = count > 0 ? `||${count}\ufe0f\u20e3||` : '||⬜||';
      }
    }

    const message = field.map((row) => row.join('')).join('\n');
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
          name: 'Einfach (5x5, 2 Minen)',
          value: 'easy',
        },
        {
          name: 'Mittel (8x8, 16 Minen)',
          value: 'medium',
        },
        {
          name: 'Schwer (11x9, 50 Minen)',
          value: 'hard',
        },
      ],
    },
    {
      name: 'width',
      description: 'Breite des Spielfeldes',
      type: ApplicationCommandOptionType.Integer,
      required: false,
    },
    {
      name: 'height',
      description: 'Höhe des Spielfeldes',
      type: ApplicationCommandOptionType.Integer,
      required: false,
    },
    {
      name: 'mines',
      description: 'Anzahl der Minen',
      type: ApplicationCommandOptionType.Integer,
      required: false,
    },
  ],
);
