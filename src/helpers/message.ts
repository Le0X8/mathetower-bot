import { EmbedBuilder, type Message } from 'discord.js';

export async function embed(
  message: Message<boolean>,
  title: string,
  description: string | null,
  content: [string, string][],
  footer: string | null,
) {
  const embed = new EmbedBuilder()
    .setColor(0x83b818)
    .setTitle(title)
    .setDescription(description)
    .addFields(...content.map(([name, value]) => ({ name, value })))
    .setFooter(footer ? { text: footer } : null);
  await message.reply({ embeds: [embed] });
}
