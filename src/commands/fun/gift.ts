import { Command } from '$commands';
import { Banane, bananeValues } from '@/commands/debug/error.ts';
import { nb } from '@/lib/helpers/bananen.ts';
import { ApplicationCommandOptionType, Role, User } from 'discord.js';
import config from '$config' with { type: 'json' };

export default new Command(
  'gift',
  'Verschenkt Bananen',
  async (interaction) => {
    const sender = interaction.user;
    const receiver = interaction.options.getMentionable('user', true);
    let amount = interaction.options.getInteger('amount', true);

    const receivers = [];

    if (receiver instanceof Role) {
      const members = await interaction.guild?.members.fetch();
      if (members)
        members.forEach((member) => {
          if (member.roles.cache.has(receiver.id)) receivers.push(member.id);
        });
    }
    if (receiver instanceof User) receivers.push(receiver.id);

    const senderBalance: Record<Banane, number> =
      store.get(sender.id, 'banane') ?? {};
    const receiverBalances: Record<Banane, number>[] = receivers.map((r) =>
      store.get(r, 'banane'),
    ) ?? [{}];

    let senderTotal = Object.entries(senderBalance).reduce(
      (acc, [key, count]) =>
        acc + (bananeValues[parseInt(key) as Banane] ?? 0) * count,
      0,
    );

    if (amount == -1) amount = senderTotal; // intentional overflow

    const singleAmount = amount;
    amount = amount * receivers.length;

    if (senderTotal < amount || amount < 1) {
      await interaction.reply({
        content: `Du hast nicht genug Bananen, um \`${nb(amount)}\` zu verschenken! Dein aktueller Kontostand beträgt \`${nb(senderTotal)}\`.`,
        ephemeral: true,
      });
      return;
    }

    const msgs: string[] = [];
    receivers.forEach((r, i) => {
      if (r == config.uid) {
        const donators: Record<string, number> = store.get('donators') ?? {};
        donators[sender.id] = (donators[sender.id] ?? 0) + singleAmount;
        store.set('donators', null, donators);
        const total = Object.values(donators).reduce((a, b) => a + b, 0);
        const part = ((donators[sender.id] / total) * 50).toFixed(2);

        msgs.push(
          `${sender} hat \`${nb(singleAmount)}\` an <@${r}> gegeben.\n-# Danke!\n-# Du bekommst jetzt ${part}% Anteil an meinem Ertrag.`,
        );
      } else
        msgs.push(`${sender} hat \`${nb(singleAmount)}\` an <@${r}> gegeben.`);

      receiverBalances[i][Banane.Gelb] =
        (receiverBalances[i][Banane.Gelb] ?? 0) + singleAmount;

      store.set(r, 'banane', receiverBalances[i]);
    });

    senderBalance[Banane.Verkauft] =
      (senderBalance[Banane.Verkauft] ?? 0) + amount;
    store.set(sender.id, 'banane', senderBalance);
    await interaction.reply(msgs.join('\n'));
  },
  false,
  [
    {
      name: 'user',
      description: 'Empfänger der Bananen',
      type: ApplicationCommandOptionType.Mentionable,
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
