import { EmbedBuilder, type Message } from 'discord.js';

export async function embed(
  message: Message<boolean>,
  title: string,
  description: string,
  content: [string, string][],
  footer: string,
) {
  const embed = new EmbedBuilder()
    .setColor(0x83b818)
    .setTitle(title)
    .setDescription(description)
    .addFields(...content.map(([name, value]) => ({ name, value })))
    .setFooter({ text: footer });
  await message.reply({ embeds: [embed] });
}
