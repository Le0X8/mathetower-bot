import { Command } from '$commands';
import { prestigeCost } from '@/commands/fun/bananen.ts';
import { Bananen, bananeStrings, BananeType } from '@/util/bananen.ts';
import { buildEmbed } from '@/lib/embeds/default-embed.ts';
import { amount, nb, priceAdjust } from '@/lib/helpers/bananen.ts';
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  Interaction,
} from 'discord.js';

const multiplierPrice = (multiplier: number) =>
  priceAdjust(
    multiplier < 50
      ? multiplier ** 1.5 * 5 + 100
      : multiplier < 100
        ? multiplier ** 1.5 * 10 + 100
        : multiplier ** 2 * 10 + 100,
  );
const landPrice = (land: number) =>
  priceAdjust(
    land < 1
      ? 0
      : land < 50
        ? land * 20 - 10
        : land < 100
          ? land * 200 - 100
          : land * 2000 - 1000,
  );

export function maxUpgrade(
  user: string,
  plantage: { land: number; multiplier: number },
  bananen: Bananen,
  action: 'max' | 'maxbalance' | 'maxland' | 'maxmultiplier',
  value: number,
) {
  const startMultiplier = plantage.multiplier;
  const startLand = plantage.land;
  const startValue = value;
  let money = value;
  switch (action) {
    case 'max':
      while (true) {
        const multiplierCost = multiplierPrice(plantage.multiplier);
        const landCost = landPrice(plantage.land);
        if (multiplierCost < landCost && money >= multiplierCost) {
          money -= multiplierCost;
          plantage.multiplier += 1;
        } else if (money >= landCost) {
          money -= landCost;
          plantage.land += 1;
        } else {
          break;
        }
      }
      break;
    case 'maxbalance':
      while (true) {
        const multiplierCost = multiplierPrice(plantage.multiplier);
        const landCost = landPrice(plantage.land);
        if (plantage.multiplier <= plantage.land && money >= multiplierCost) {
          money -= multiplierCost;
          plantage.multiplier += 1;
        } else if (plantage.multiplier > plantage.land && money >= landCost) {
          money -= landCost;
          plantage.land += 1;
        } else {
          break;
        }
      }
      break;
    case 'maxland':
      while (true) {
        const landCost = landPrice(plantage.land);
        if (money >= landCost) {
          money -= landCost;
          plantage.land += 1;
        } else {
          break;
        }
      }
      break;
    case 'maxmultiplier':
      while (true) {
        const multiplierCost = multiplierPrice(plantage.multiplier);
        if (money >= multiplierCost) {
          money -= multiplierCost;
          plantage.multiplier += 1;
        } else {
          break;
        }
      }
      break;
  }

  const spent = startValue - money;
  bananen.remove(spent);
  store.set(user, 'plantage', plantage);
  return [startMultiplier, startLand, spent, money];
}

export default new Command(
  'plantage',
  'Pflanze deine eigenen Bananen an!',
  async (interaction) => {
    const user = interaction.options.getUser('user', false) || interaction.user;
    let action = interaction.options.getString('action', false) || 'view';
    if (user.id !== interaction.user.id) action = 'view';

    const bananen = new Bananen(user.id);
    const value = bananen.getValue();

    const plantage: { land: number; multiplier: number } = store.get(
      user.id,
      'plantage',
    ) ?? { land: 0, multiplier: 1 };
    switch (action) {
      case 'land':
        if (value < landPrice(plantage.land)) {
          await interaction.reply({
            content: `Du hast nicht genug Bananen, um mehr Land zu kaufen! Dein aktueller Kontostand beträgt \`${nb(value)}\`. Der Preis für das nächste Land beträgt \`${nb(landPrice(plantage.land))}\`.`,
            ephemeral: true,
          });
          return;
        }
        plantage.land += 1;
        const spentLand = landPrice(plantage.land - 1);
        bananen.remove(spentLand);
        store.set(user.id, 'plantage', plantage);
        await interaction.reply(
          `Du hast erfolgreich 1m² Land für deine Plantage gekauft! Deine Plantage hat jetzt eine Fläche von **${
            plantage.land
          }m²**.\n\n-# Du hast \`${nb(spentLand)}\` für dieses Upgrade ausgegeben. Dein aktueller Kontostand beträgt \`${nb(value - spentLand)}\`.`,
        );
        break;
      case 'multiplier':
        if (value < multiplierPrice(plantage.multiplier)) {
          await interaction.reply({
            content: `Du hast nicht genug Bananen, um den Multiplikator zu erhöhen! Dein aktueller Kontostand beträgt \`${nb(value)}\`. Der Preis für den nächsten Multiplikator beträgt \`${nb(multiplierPrice(plantage.multiplier))}\`.`,
            ephemeral: true,
          });
          return;
        }
        plantage.multiplier += 1;
        const spentMultiplier = multiplierPrice(plantage.multiplier - 1);
        bananen.remove(spentMultiplier);
        store.set(user.id, 'plantage', plantage);
        await interaction.reply(
          `Du hast erfolgreich den Multiplikator deiner Plantage erhöht! Deine Plantage hat jetzt einen Multiplikator von **${
            plantage.multiplier
          }x**.\n\n-# Du hast \`${nb(spentMultiplier)}\` für dieses Upgrade ausgegeben. Dein aktueller Kontostand beträgt \`${nb(value - spentMultiplier)}\`.`,
        );
        break;
      case 'max':
      case 'maxbalance':
      case 'maxland':
      case 'maxmultiplier':
        const [startMultiplier, startLand, spent, money] = maxUpgrade(
          user.id,
          plantage,
          bananen,
          action,
          value,
        );
        await interaction.reply(
          `Du hast erfolgreich \`${
            plantage.multiplier - startMultiplier
          }x\` Multiplikator und \`${
            plantage.land - startLand
          }m²\` Land gekauft!\n\nDeine Plantage hat jetzt einen Multiplikator von **${
            plantage.multiplier
          }x**.\nDeine Plantage hat jetzt eine Fläche von **${
            plantage.land
          }m²**.\n\n-# Du hast \`${nb(spent)}\` für diese Upgrades ausgegeben. Dein aktueller Kontostand beträgt \`${nb(money)}\`.`,
        );
        break;

      default:
        const prestige = store.get(user.id, 'prestige') ?? 0;
        const buyLand = new ButtonBuilder()
          .setCustomId('buyLand')
          .setLabel('Land kaufen')
          .setStyle(ButtonStyle.Primary)
          .setCustomId('land');
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
          buyLand,
        );
        const msg = await interaction.reply({
          embeds: [
            await buildEmbed(
              'Plantage von @' + user.username,
              plantage.land < 1
                ? 'Dieser Nutzer hat noch kein Land für seine Plantage gekauft.\nNutze `/plantage action:Land kaufen` um für 100nb 1m² Land zu kaufen.'
                : `**Ertrag/min:** \`${amount(plantage.land * plantage.multiplier * (prestige * 2 + 1))}\` ${bananeStrings(BananeType.Geerntet)[1]}`,
              [
                [
                  `Land: \`${plantage.land}m²\``,
                  `Nächster Kauf: \`${nb(landPrice(plantage.land))}\``,
                ],
                [
                  `Multiplikator: \`${plantage.multiplier}x\``,
                  `Nächster Kauf: \`${nb(multiplierPrice(plantage.multiplier))}\``,
                ],
                prestige > 0 && [
                  `Prestige-Bonus: \`${prestige * 200}%\``,
                  `Nächstes Prestige-Level: \`${nb(prestigeCost(prestige))}\``,
                ],
              ].filter(Boolean) as [string, string][],
              null,
            ),
          ],
          components: [row],
          withResponse: true,
        });

        const collectorFilter = (i: Interaction) =>
          i.user.id === interaction.user.id;

        try {
          const action = await msg.resource?.message?.awaitMessageComponent({
            filter: collectorFilter,
            time: 20_000,
          });
          msg.resource?.message?.reply(action?.customId as string);
        } catch {
          await interaction.editReply({
            components: [],
          });
        }
    }
  },
  false,
  [
    {
      name: 'user',
      description: 'Wessen Plantage möchtest du sehen?',
      type: ApplicationCommandOptionType.User,
      required: false,
    },
    {
      name: 'action',
      description: 'Was möchtest du tun?',
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: [
        {
          name: 'Land kaufen',
          value: 'land',
        },
        {
          name: 'Multiplikator kaufen',
          value: 'multiplier',
        },
        {
          name: 'Maximales Upgrade (nach Preis)',
          value: 'max',
        },
        {
          name: 'Maximales Upgrade (mit Balancing)',
          value: 'maxbalance',
        },
        {
          name: 'Maximales Upgrade (nur Land)',
          value: 'maxland',
        },
        {
          name: 'Maximales Upgrade (nur Multiplikator)',
          value: 'maxmultiplier',
        },
      ],
    },
  ],
);
