import { Command } from '$commands';
import { nb, amount as am } from '@/lib/helpers/bananen.ts';
import { Bananen, BananeType } from '@/util/bananen.ts';
import { ApplicationCommandOptionType } from 'discord.js';

export default new Command(
  'gamble',
  'Teste dein Glück und setze Bananen ein, um sie zu vervielfachen oder zu verlieren!',
  async (interaction) => {
    const balance = new Bananen(interaction.user.id);
    let amount = interaction.options.getInteger('amount', true);
    let multiplier = Math.abs(interaction.options.getNumber('multiplier') ?? 2);
    if (multiplier == 0) multiplier = 2;

    amount = balance.getAmount(amount);

    const chance = 1 / multiplier;
    const roll = Math.random();

    if (roll <= chance) {
      const winnings = Math.floor(amount * (multiplier - 1));
      balance.add(BananeType.Gold, winnings).save();
      await interaction.reply(
        `Glückwunsch! Du hast ${am(winnings)} goldene Bananen <:gold:1518542283488755712> gewonnen! 🎉`,
      );
    } else {
      balance.remove(amount).save();
      await interaction.reply(
        `Oh nein! Du hast ${nb(amount)} Bananen verloren. 😢 Versuch es nochmal!`,
      );
    }
  },
  false,
  [
    {
      name: 'amount',
      description: 'Die Anzahl der Bananen, die du setzen möchtest',
      type: ApplicationCommandOptionType.Integer,
      required: true,
    },
    {
      name: 'multiplier',
      description:
        'Der Multiplikator, den du anstrebst (default 2 für Verdopplung), hat dann aber niedrigere Chancen',
      type: ApplicationCommandOptionType.Number,
      required: false,
    },
  ],
);
