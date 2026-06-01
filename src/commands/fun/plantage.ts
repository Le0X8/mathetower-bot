import { Command } from '$commands';
import { Banane, bananeStrings, bananeValues } from '@/commands/debug/error.ts';
import { buildEmbed } from '@/lib/embeds/default-embed.ts';
import { amount, nb, priceAdjust } from '@/lib/helpers/bananen.ts';
import { ApplicationCommandOptionType } from 'discord.js';

const multiplierPrice = (multiplier: number) =>
  priceAdjust(multiplier ** 2 * 10 + 100);
const landPrice = (land: number) =>
  priceAdjust(land < 1 ? 100 : land * 2000 - 1000);

export default new Command(
  'plantage',
  'Pflanze deine eigenen Bananen an!',
  async (interaction) => {
    const user = interaction.options.getUser('user', false) || interaction.user;
    let action = interaction.options.getString('action', false) || 'view';
    if (user.id !== interaction.user.id) action = 'view';

    const bananen: Record<Banane, number> = store.get(user.id, 'banane') ?? {};
    const value = Object.entries(bananen).reduce(
      (acc, [key, count]) =>
        acc + (bananeValues[parseInt(key) as Banane] ?? 0) * count,
      0,
    );

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
        bananen[Banane.Verkauft] = (bananen[Banane.Verkauft] ?? 0) + spentLand;
        store.set(user.id, 'banane', bananen);
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
        bananen[Banane.Verkauft] =
          (bananen[Banane.Verkauft] ?? 0) + spentMultiplier;
        store.set(user.id, 'banane', bananen);
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
              if (
                plantage.multiplier < plantage.land &&
                money >= multiplierCost
              ) {
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
                plantage.land += 1;
              } else {
                break;
              }
            }
            break;
        }

        const spent = startValue - money;
        bananen[Banane.Verkauft] = (bananen[Banane.Verkauft] ?? 0) + spent;
        store.set(user.id, 'banane', bananen);
        store.set(user.id, 'plantage', plantage);
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
        await interaction.reply({
          embeds: [
            await buildEmbed(
              'Plantage von @' + user.username,
              plantage.land < 1
                ? 'Dieser Nutzer hat noch kein Land für seine Plantage gekauft.\nNutze `/plantage action:Land kaufen` um für 100nb 1m² Land zu kaufen.'
                : `**Ertrag/min:** \`${amount(plantage.land * plantage.multiplier)}\` ${bananeStrings(Banane.Geerntet)[1]}`,
              [
                [
                  `Land: \`${plantage.land}m²\``,
                  `Nächster Kauf: \`${nb(landPrice(plantage.land))}\``,
                ],
                [
                  `Multiplikator: \`${plantage.multiplier}x\``,
                  `Nächster Kauf: \`${nb(multiplierPrice(plantage.multiplier))}\``,
                ],
              ],
              null,
            ),
          ],
        });
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
