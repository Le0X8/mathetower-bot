import { Command } from '$commands';

export default new Command('random', 'random halt', async (interaction) => {
  const length = Math.floor(Math.random() * 7) + 3;
  const randomString = Array.from({ length }, () =>
    String.fromCharCode(Math.floor(Math.random() * 26) + 97),
  ).join('');

  await interaction.reply(randomString);
});
