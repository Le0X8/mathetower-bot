//<:sbahnane:1506733319188910210>
import { Command } from '$commands';
import { Banane, bananeValues } from '@/commands/debug/error.ts';
import { ApplicationCommandOptionType } from 'discord.js';

export default new Command(
  'minuten',
  'Zeigt alle deine gesammelten Minuten an oder konvertiert sie in Bananen',
  async (interaction) => {
    const user = interaction.user;
    const amount = interaction.options.getInteger('amount', false) ?? 0;

    const trains = store.get(user.id, 's1-trains') ?? [];
    const totalMinutes = trains
      .map((id: string) => store.get(id, 's1')?.delayMinutes ?? 0)
      .reduce((sum: number, m: number) => sum + m, 0);

    if (amount !== 0) {
      await interaction.reply('unimplemented...');
    } else
      await interaction.reply(
        `<@${user.id}> hat insgesamt **${totalMinutes} Minute${totalMinutes == 1 ? '' : 'n'}** gesammelt.`,
      );
  },
  false,
  [
    {
      name: 'amount',
      description: 'Anzahl der umzuwandelnden Minuten, -1 für alles',
      type: ApplicationCommandOptionType.Integer,
      required: false,
    },
  ],
);
