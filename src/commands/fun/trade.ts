import { Command } from '$commands';
import { getId, getValue, MutatedBanane } from '$commands/fun/mutation.ts';
import { emojis } from '$emojis';
import { buildEmbed } from '@/lib/embeds/default-embed.ts';
import { nb } from '@/lib/helpers/bananen.ts';
import { ApplicationCommandOptionType } from 'discord.js';

export default new Command(
  'trade',
  'Tausche deine mutierten Bananen!',
  async (interaction) => {
    const user = interaction.options.getUser('user', false) ?? null;
    const id = interaction.options.getInteger('id', true);
    const mutated = store.get(
      interaction.user.id,
      'mutated',
    ) as MutatedBanane[];
    const mutation = mutated?.[id - 1];
    if (!mutation) {
      await interaction.reply({
        content: `Du hast keine mutierte Bananensorte mit der ID \`${id}\`!`,
        ephemeral: true,
      });
      return;
    }
    const amount =
      interaction.options.getInteger('amount', false) ?? getValue(mutation);

    if (amount < 0) {
      await interaction.reply({
        content: `Du kannst keine negativen Bananen bekommen!`,
        ephemeral: true,
      });
      return;
    }

    const trades = store.get('trades') ?? [];
    trades.push([interaction.user.id, user?.id ?? null, mutation, amount]);
    mutated.splice(id - 1, 1);
    store.set(interaction.user.id, 'mutated', mutated);
    store.set('trades', null, trades);

    await interaction.reply({
      content:
        `Du hast erfolgreich deine **#${getId(mutation)}** für ${nb(amount)} zum Handel angeboten!\n\nTrade-ID: \`${
          trades.length
        }\`\nNutze \`/accept id:${trades.length}\`, um die Transaktion durchzuführen oder die Mutation zurückzunehmen!` +
        (user
          ? `\n\nDiese Banane kann nur von <@${user}> gekauft werden.`
          : ''),
    });
  },
  false,
  [
    {
      name: 'id',
      description: 'Die ID der mutierten Banane, die du handeln möchtest.',
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
    {
      name: 'amount',
      description:
        'Die Menge an Bananen, die du für diese mutierte Banane haben möchtest. (Standard: Wert der Banane)',
      type: ApplicationCommandOptionType.Integer,
      required: false,
    },
    {
      name: 'user',
      description:
        'Der Benutzer, der diese mutierte Banane kaufen darf. (Optional)',
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],
);
