import { Command } from '$commands';
import {
  aboutBanane,
  getId,
  getValue,
  MutatedBanane,
} from '$commands/fun/mutation.ts';
import { emojis } from '$emojis';
import { buildEmbed } from '@/lib/embeds/default-embed.ts';
import { nb } from '@/lib/helpers/bananen.ts';
import { Bananen } from '@/util/bananen.ts';
import { ApplicationCommandOptionType } from 'discord.js';

export default new Command(
  'accept',
  'Akzeptiert ein Angebot eines anderen Spielers!',
  async (interaction) => {
    const id = interaction.options.getInteger('id', true);
    const trades = store.get('trades') ?? [];
    const trade = trades[id - 1];
    if (!trade) {
      await interaction.reply({
        content: `Es gibt kein Angebot mit der ID \`${id}\`!`,
        ephemeral: true,
      });
      return;
    }

    const [senderId, receiverId, mutation, amount] = trade;

    if (interaction.options.getBoolean('view', false)) {
      await interaction.reply({
        embeds: [await aboutBanane(mutation)],
      });
      return;
    }

    if (senderId === interaction.user.id) {
      const mutated = (store.get(senderId, 'mutated') as MutatedBanane[]) ?? [];
      mutated.push(mutation);
      store.set(senderId, 'mutated', mutated);
      trades[id - 1] = 0;
      store.set('trades', null, trades);

      await interaction.reply({
        content: `Du hast erfolgreich dein Angebot zurückgenommen!`,
      });
      return;
    }

    const balance = new Bananen(interaction.user.id);
    if (receiverId && receiverId !== interaction.user.id) {
      await interaction.reply({
        content: `Dieses Angebot ist nur für <@${receiverId}> verfügbar!`,
        ephemeral: true,
      });
      return;
    }

    if (balance.getValue() < amount) {
      await interaction.reply({
        content: `Du hast nicht genug Bananen, um dieses Angebot zu akzeptieren! Dein aktueller Kontostand beträgt \`${nb(
          balance.getValue(),
        )}\`.`,
        ephemeral: true,
      });
      return;
    }

    const senderBalance = new Bananen(senderId);
    balance.transfer(senderBalance, amount);

    const mutated = (store.get(senderId, 'mutated') as MutatedBanane[]) ?? [];
    mutated.push(mutation);
    store.set(senderId, 'mutated', mutated);

    trades[id - 1] = 0;
    store.set('trades', null, trades);

    await interaction.reply({
      content: `Du hast erfolgreich das Angebot von <@${senderId}> akzeptiert und **#${getId(
        mutation,
      )}** für ${nb(amount)} erhalten!`,
    });
  },
  false,
  [
    {
      name: 'id',
      description: 'Die ID des Angebots, das du akzeptieren möchtest.',
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
    {
      name: 'view',
      description: 'Zeigt die Details des Angebots an, ohne es zu akzeptieren.',
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
  ],
);
