import { Command } from '$commands';
import { Bananen } from '@/util/bananen.ts';
import { nb } from '@/lib/helpers/bananen.ts';
import { ChatInputCommandInteraction, TextChannel } from 'discord.js';

export default new Command('error', 'schlägt fehl', async (_interaction) => {
  throw new Error('banane 🍌');
});

export async function catchBanane(
  interaction: ChatInputCommandInteraction,
  fromError: boolean = true,
) {
  if (!(interaction.channel instanceof TextChannel)) return;
  const bal = new Bananen(interaction.user.id);
  const { strs, count, value } = bal.addRandom();

  await interaction.channel.send(
    (fromError ? `-# <@${interaction.user.id}> used \`/error\`\n\n` : '') +
      `danke bro, hier hast du eine **${strs[0]} Banane** ${strs[1]} (\`+${nb(value)}\`).\nDu hast jetzt \`${count}\` davon.\n\n_${strs[2]}_`,
  );
}
