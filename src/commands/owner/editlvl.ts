import { Command } from '$commands';
import config from '$config' with { type: 'json' };
import { ApplicationCommandOptionType } from 'discord.js';

export default new Command(
  'zzz-owner-editlvl',
  '[Owner-exclusive] Bearbeitet Bananen-Levels',
  async (interaction) => {
    if (interaction.user.id !== config.owner) {
      await interaction.reply({
        content: 'You are not permitted to use this command.',
        ephemeral: true,
      });
      return;
    }

    const user = interaction.options.getUser('user', true);
    const property = interaction.options.getString('property', true);
    const value = interaction.options.getInteger('value', false);

    const plantage = store.get(user.id, 'plantage') ?? {
      land: 0,
      multiplier: 1,
    };
    const prestige = store.get(user.id, 'prestige') ?? 0;

    switch (property) {
      case 'land':
        if (typeof value != 'number') {
          await interaction.reply({
            content:
              'Dieser Nutzer hat aktuell folgendes Land-Level: ' +
              plantage.land,
            ephemeral: true,
          });
          return;
        }
        plantage.land = value;
        store.set(user.id, 'plantage', plantage);
        await interaction.reply(
          `Land-Level von ${user.username} wurde auf ${value} gesetzt.`,
        );
        break;
      case 'multiplier':
        if (typeof value != 'number') {
          await interaction.reply({
            content:
              'Dieser Nutzer hat aktuell folgenden Multiplier: ' +
              plantage.multiplier,
            ephemeral: true,
          });
          return;
        }
        plantage.multiplier = value;
        store.set(user.id, 'plantage', plantage);
        await interaction.reply(
          `Multiplier von ${user.username} wurde auf ${value} gesetzt.`,
        );
        break;
      case 'prestige':
        if (typeof value != 'number') {
          await interaction.reply({
            content:
              'Dieser Nutzer hat aktuell folgendes Prestige-Level: ' + prestige,
            ephemeral: true,
          });
          return;
        }
        store.set(user.id, 'prestige', value);
        await interaction.reply(
          `Prestige-Level von ${user.username} wurde auf ${value} gesetzt.`,
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
          name: 'Land',
          value: 'land',
        },
        {
          name: 'Multiplier',
          value: 'multiplier',
        },
        {
          name: 'Prestige',
          value: 'prestige',
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
