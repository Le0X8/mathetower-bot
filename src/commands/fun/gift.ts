import { Command } from '$commands';
import { Banane, bananeStrings, bananeValues } from '@/commands/debug/error.ts';
import { buildEmbed } from '@/lib/embeds/default-embed.ts';
import { ApplicationCommandOptionType } from 'discord.js';

export default new Command(
  'gift',
  'Verschenkt Bananen',
  async (interaction) => {
    const sender = interaction.user;
    const receiver = interaction.options.getUser('user', true);
    const amount = interaction.options.getInteger('amount', true);

    const senderBalance: Record<Banane, number> =
      store.get(sender.id, 'banane') ?? {};
    const receiverBalance: Record<Banane, number> =
      store.get(receiver.id, 'banane') ?? {};

    let senderTotal = Object.entries(senderBalance).reduce(
      (acc, [key, count]) =>
        acc + (bananeValues[parseInt(key) as Banane] ?? 0) * count,
      0,
    );

    if (senderTotal < amount || amount < 1) {
      await interaction.reply({
        content: `Du hast nicht genug Bananen, um \`${amount}nb\` zu verschenken! Dein aktueller Kontostand beträgt \`${senderTotal}nb\`.`,
        ephemeral: true,
      });
      return;
    }

    await interaction.reply(
      `${sender} hat \`${amount}nb\` an ${receiver} gegeben.`,
    );

    senderBalance[Banane.Verkauft] =
      (senderBalance[Banane.Verkauft] ?? 0) + amount;
    receiverBalance[Banane.Gelb] = (receiverBalance[Banane.Gelb] ?? 0) + amount;

    store.set(sender.id, 'banane', senderBalance);
    store.set(receiver.id, 'banane', receiverBalance);
  },
  false,
  [
    {
      name: 'user',
      description: 'Empfänger der Bananen',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: 'amount',
      description: 'Anzahl der zu verschenkenden normalen Bananen (in nb)',
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
);
