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

    const bananen = new Bananen(user.id);
    const value = bananen.getValue();

    const plantage: { land: number; multiplier: number } = store.get(
      user.id,
      'plantage',
    ) ?? { land: 0, multiplier: 1 };
    const prestige = store.get(user.id, 'prestige') ?? 0;
    const singleItem = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel('Land kaufen')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('land'),
      new ButtonBuilder()
        .setLabel('Multiplikator kaufen')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('multiplier'),
      new ButtonBuilder()
        .setLabel('1x')
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('switchtomax'),
    );
    const maxItem = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel('Land kaufen')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('land'),
      new ButtonBuilder()
        .setLabel('Multiplikator kaufen')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('multiplier'),
      new ButtonBuilder()
        .setLabel('MAX')
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('switchtoall'),
    );
    const allItem = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel('nach Preis')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('max'),
      new ButtonBuilder()
        .setLabel('mit Balancing')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('maxbalance'),
      new ButtonBuilder()
        .setLabel('Alles')
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('switchtosingle'),
    );
    const msg = await interaction.reply({
      embeds: [
        await buildEmbed(
          'Plantage von @' + user.username,
          plantage.land < 1
            ? 'Dieser Nutzer hat noch kein Land für seine Plantage gekauft.\nNutze den Knopf unten, um 1m² Land zu kaufen.'
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
      components: [singleItem],
      withResponse: true,
    });

    const collectorFilter = (i: Interaction) => i.user.id === user.id;

    while (true) {
      try {
        const action = await msg.resource?.message?.awaitMessageComponent({
          filter: collectorFilter,
          time: 20_000, // 20 secs
        });

        switch (action?.customId) {
          case 'land':
            if (value < landPrice(plantage.land)) {
              await action?.reply({
                content: `Du hast nicht genug Bananen, um mehr Land zu kaufen! Dein aktueller Kontostand beträgt \`${nb(value)}\`. Der Preis für das nächste Land beträgt \`${nb(landPrice(plantage.land))}\`.`,
                ephemeral: true,
              });
              return;
            }
            plantage.land += 1;
            const spentLand = landPrice(plantage.land - 1);
            bananen.remove(spentLand);
            store.set(user.id, 'plantage', plantage);
            await action?.reply(
              `Du hast erfolgreich 1m² Land für deine Plantage gekauft! Deine Plantage hat jetzt eine Fläche von **${
                plantage.land
              }m²**.\n\n-# Du hast \`${nb(spentLand)}\` für dieses Upgrade ausgegeben. Dein aktueller Kontostand beträgt \`${nb(value - spentLand)}\`.`,
            );
            break;
          case 'multiplier':
            if (value < multiplierPrice(plantage.multiplier)) {
              await action?.reply({
                content: `Du hast nicht genug Bananen, um den Multiplikator zu erhöhen! Dein aktueller Kontostand beträgt \`${nb(value)}\`. Der Preis für den nächsten Multiplikator beträgt \`${nb(multiplierPrice(plantage.multiplier))}\`.`,
                ephemeral: true,
              });
              return;
            }
            plantage.multiplier += 1;
            const spentMultiplier = multiplierPrice(plantage.multiplier - 1);
            bananen.remove(spentMultiplier);
            store.set(user.id, 'plantage', plantage);
            await action?.reply(
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
              action?.customId,
              value,
            );
            await action?.reply(
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
          case 'switchtomax':
            await interaction.editReply({
              components: [maxItem],
            });
            await action?.deferUpdate().catch(() => {});
            break;
          case 'switchtoall':
            await interaction.editReply({
              components: [allItem],
            });
            await action?.deferUpdate().catch(() => {});
            break;
          case 'switchtosingle':
            await interaction.editReply({
              components: [singleItem],
            });
            await action?.deferUpdate().catch(() => {});
            break;
        }
      } catch {
        await interaction.editReply({
          components: [],
        });
        break;
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
  ],
);
