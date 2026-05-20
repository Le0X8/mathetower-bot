import { Command } from '$commands';
import { Banane } from '@/commands/debug/error.ts';
import { ApplicationCommandOptionType } from 'discord.js';

export default new Command(
  'minuten',
  'Zeigt alle deine gesammelten Minuten an oder konvertiert sie in Bananen',
  async (interaction) => {
    const user = interaction.options.getUser('user', false) || interaction.user;
    let amount = interaction.options.getInteger('amount', false) ?? 0;

    const trains = store.get(user.id, 's1-trains') ?? [];
    const totalMinutes = trains
      .map((id: string) => store.get(id, 's1')?.delayMinutes ?? 0)
      .reduce((sum: number, m: number) => sum + m, 0);

    if (amount == -1) amount = totalMinutes; // intentional overflow

    if (
      amount > 0 &&
      user.id === interaction.user.id &&
      totalMinutes >= amount
    ) {
      await interaction.reply(
        'Du hast ' +
          amount +
          ' Minute' +
          (amount == 1 ? 'n' : '') +
          ' in **<:sbahnane:1506733319188910210> S-Bahnanen** umgewandelt!\nDu hast jetzt ' +
          (totalMinutes - amount) +
          ' Minute' +
          (totalMinutes - amount == 1 ? 'n' : '') +
          ' übrig.',
      );

      const balance: Record<Banane, number> =
        store.get(user.id, 'banane') ?? {};
      balance[Banane.Sbahn] = (balance[Banane.Sbahn] ?? 0) + amount;
      store.set(user.id, 'banane', balance);
    } else
      await interaction.reply(
        `<@${user.id}> hat insgesamt **${totalMinutes} Minute${totalMinutes == 1 ? '' : 'n'}** gesammelt.`,
      );
  },
  false,
  [
    {
      name: 'user',
      description: 'Wessen Minuten möchtest du sehen?',
      type: ApplicationCommandOptionType.User,
      required: false,
    },
    {
      name: 'amount',
      description: 'Anzahl der umzuwandelnden Minuten, -1 für alles',
      type: ApplicationCommandOptionType.Integer,
      required: false,
    },
  ],
);
