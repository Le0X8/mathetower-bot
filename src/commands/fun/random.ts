import { Command } from '$commands';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

export default new Command('random', 'random halt', async (interaction) => {
  if (!existsSync('./words.json')) writeFileSync('./words.json', '{}', 'utf8');
  const wordList: Record<string, number> = JSON.parse(
    readFileSync('./words.json', 'utf8'),
  );
  const words = Object.keys(wordList);

  await interaction.reply(words[Math.floor(Math.random() * words.length)]);
});
