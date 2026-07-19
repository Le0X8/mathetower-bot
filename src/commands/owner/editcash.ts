import { Command } from '$commands';
import config from '$config' with { type: 'json' };
import { Bananen, BananeType } from '@/api/bananen.ts';
import { ApplicationCommandOptionType } from 'discord.js';

export default new Command(
  'zzz-owner-editcash',
  '[Owner-exclusive] Bearbeitet Bananen',
  async (interaction) => {
    if (interaction.user.id !== config.owner_uid) {
      await interaction.reply({
        content: 'You are not permitted to use this command.',
        ephemeral: true,
      });
      return;
    }

    const user = interaction.options.getUser('user', true);
    const property = interaction.options.getString('property', true);
    const value = interaction.options.getInteger('value', false);

    let balance = new Bananen(user.id);
    const donators: Record<string, number> = store.get('donators') ?? {};
    const invested = donators[user.id] ?? 0;
    const cash = balance.getValue();

    switch (property) {
      case 'invested':
        if (typeof value != 'number') {
          await interaction.reply({
            content: `Dieser Nutzer hat aktuell ${invested} investierte Bananen.`,
            ephemeral: true,
          });
          return;
        }
        donators[user.id] = value;
        store.set('donators', null, donators);
        await interaction.reply(
          `Investierte Bananen von ${user.username} wurden auf ${value} gesetzt.`,
        );
        break;
      case 'cash':
        if (typeof value != 'number') {
          await interaction.reply({
            content: `Dieser Nutzer hat aktuell ${cash} Bananen.`,
            ephemeral: true,
          });
          return;
        }
        balance.setValue(value);
        await interaction.reply(
          `Bananen von ${user.username} wurden auf ${value} gesetzt.`,
        );
        break;
    }
  },
  false,
  [
    {
      name: 'user',
      description: 'user',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: 'property',
      description: 'property',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        {
          name: 'Invested',
          value: 'invested',
        },
        {
          name: 'Cash',
          value: 'cash',
        },
      ],
    },
    {
      name: 'value',
      description: 'value',
      type: ApplicationCommandOptionType.Integer,
      required: false,
    },
  ],
);
