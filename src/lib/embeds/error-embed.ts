import { EmbedBuilder } from 'discord.js';

export async function buildErrorEmbed(
  { name, message, stack }: Error,
  detail?: string,
) {
  const embed = new EmbedBuilder()
    .setColor(0xff0000)
    .setTitle(detail ?? `${name}: ${message}`)
    .setDescription(`\`\`\`${stack}\`\`\``);
  return embed;
}
