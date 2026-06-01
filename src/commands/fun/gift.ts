import { Command } from '$commands';
import { Banane, bananeValues } from '@/commands/debug/error.ts';
import { nb } from '@/lib/helpers/bananen.ts';
import { ApplicationCommandOptionType } from 'discord.js';
import config from '$config' with { type: 'json' };

export default new Command(
  'gift',
  'Verschenkt Bananen',
  async (interaction) => {
    const sender = interaction.user;
    const receiver = interaction.options.getUser('user', true);
    let amount = interaction.options.getInteger('amount', true);

    const senderBalance: Record<Banane, number> =
      store.get(sender.id, 'banane') ?? {};
    const receiverBalance: Record<Banane, number> =
      store.get(receiver.id, 'banane') ?? {};

    let senderTotal = Object.entries(senderBalance).reduce(
      (acc, [key, count]) =>
        acc + (bananeValues[parseInt(key) as Banane] ?? 0) * count,
      0,
    );

    if (amount == -1) amount = senderTotal; // intentional overflow

    if (senderTotal < amount || amount < 1) {
      await interaction.reply({
        content: `Du hast nicht genug Bananen, um \`${nb(amount)}\` zu verschenken! Dein aktueller Kontostand beträgt \`${nb(senderTotal)}\`.`,
        ephemeral: true,
      });
      return;
    }

    if (receiver.id == config.uid) {
      const donators: Record<string, number> = store.get('donators') ?? {};
      donators[sender.id] = (donators[sender.id] ?? 0) + amount;
      store.set('donators', null, donators);
      const total = Object.values(donators).reduce((a, b) => a + b, 0);
      const part = ((donators[sender.id] / total) * 50).toFixed(2);

      await interaction.reply(
        `${sender} hat \`${nb(amount)}\` an ${receiver} gegeben.\nDanke!\n\nDu bekommst jetzt ${part}% Anteil an meinem Ertrag.`,
      );
    } else
      await interaction.reply(
        `${sender} hat \`${nb(amount)}\` an ${receiver} gegeben.`,
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
      description:
        'Anzahl der zu verschenkenden normalen Bananen (in \u0e3f), -1 für alles',
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
  ],
);
