import { EmbedBuilder } from 'discord.js';

export async function buildErrorEmbed(errorMessage: string) {
  const embed = new EmbedBuilder()
    .setColor(0xff0000)
    .setTitle('Error')
    .setDescription(errorMessage);
  return embed;
}
