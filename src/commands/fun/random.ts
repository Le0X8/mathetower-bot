import { Command } from '$commands';

const vocals = ['a', 'e', 'i', 'o', 'u'];
const consonants = [
  'b',
  'c',
  'd',
  'f',
  'g',
  'h',
  'j',
  'k',
  'l',
  'm',
  'n',
  'p',
  'q',
  'r',
  's',
  't',
  'v',
  'w',
  'x',
  'y',
  'z',
];

export default new Command('random', 'random halt', async (interaction) => {
  const length = Math.floor(Math.random() * 7) + 3;
  let vocal = false;
  const randomString = Array.from({ length }, (_) => {
    if (Math.random() < 0.5) vocal = !vocal;
    vocal = !vocal;
    return vocal
      ? consonants[Math.floor(Math.random() * consonants.length)]
      : vocals[Math.floor(Math.random() * vocals.length)];
  }).join('');

  await interaction.reply(randomString);
});
