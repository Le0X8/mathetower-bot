import { EmbedBuilder } from 'discord.js';

export async function buildActionFailedEmbed(message: string) {
  const embed = new EmbedBuilder()
    .setColor(0xff0000)
    .setTitle('Aktion Fehlgeschlagen')
    .setDescription(message);
  return embed;
}
