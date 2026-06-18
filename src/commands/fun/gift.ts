import { Command } from '$commands';
import { nb } from '@/lib/helpers/bananen.ts';
import { ApplicationCommandOptionType, GuildMember, Role } from 'discord.js';
import config from '$config' with { type: 'json' };
import { Bananen, BananeType } from '@/util/bananen.ts';

export default new Command(
  'gift',
  'Verschenkt Bananen',
  async (interaction) => {
    const sender = interaction.user;
    const receiver = interaction.options.getMentionable('user', true);
    let amount = interaction.options.getInteger('amount', true);

    const receivers = [];

    if (receiver instanceof Role)
      receiver.members.forEach((m) => receivers.push(m.id));

    if (receiver instanceof GuildMember)
      receivers.push(receiver.id ?? receiver.user.id);

    const senderBalance = new Bananen(sender.id);
    const receiverBalances: Bananen[] = receivers.map((r) => new Bananen(r));

    let senderTotal = senderBalance.getValue();

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

      senderBalance.transfer(receiverBalances[i], singleAmount);
    });

    await interaction.reply(msgs.slice(0, 20).join('\n'));

    if (msgs.length > 20) {
      for (let i = 20; i < msgs.length; i += 20) {
        await interaction.followUp(msgs.slice(i, i + 20).join('\n'));
      }
    }
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
