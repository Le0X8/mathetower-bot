import { Command } from '$commands';
import { nb } from '@/lib/helpers/bananen.ts';
import { ApplicationCommandOptionType, GuildMember, Role } from 'discord.js';
import config from '$config' with { type: 'json' };
import { Bananen, BananeType } from '@/util/bananen.ts';
import { Plantage } from '@/util/plantage.ts';
import { getMutation } from '$commands/fun/mutation.ts';

export default new Command(
  'gift',
  'Verschenkt Bananen',
  async (interaction) => {
    const sender = interaction.user;
    const buff = getMutation(sender.id).investment;
    const receiver = interaction.options.getMentionable('user', true);
    let amount: string | number = interaction.options.getString('amount', true);

    if (new Plantage(sender.id).plantage.infection > 99) {
      await interaction.reply({
        content: `Du bist zu stark infiziert, um Bananen zu verschenken!`,
        ephemeral: true,
      });
      return;
    }

    const receivers = [];

    if (receiver instanceof Role)
      receiver.members.forEach((m) => receivers.push(m.id));

    if (receiver instanceof GuildMember)
      receivers.push(receiver.id ?? receiver.user.id);

    const senderBalance = new Bananen(sender.id);
    const receiverBalances: Bananen[] = receivers.map((r) => new Bananen(r));

    let senderTotal = senderBalance.getValue();

    amount = senderBalance.getAmount(amount);

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
      if (new Plantage(r).plantage.infection > 99) {
        msgs.push(`<@${r}> ist zu stark infiziert, um Bananen zu empfangen!`);
        return;
      }

      const cooldown = store.get(r, 'giftcooldown') ?? 0;
      if (Date.now() < cooldown) {
        msgs.push(
          `<@${r}> kann bis zum <t:${Math.floor(cooldown / 1000)}:f> keine Bananen empfangen!`,
        );
        return;
      }

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

      const chance = Math.random() < Math.abs(buff) * 0.05;
      if (buff > 0 && chance) {
        senderBalance.add(BananeType.Gelb, Math.floor(singleAmount * 0.19));
      } else if (buff < 0 && chance) {
        senderBalance.remove(Math.floor(singleAmount * 0.19));
      }
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
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
);
