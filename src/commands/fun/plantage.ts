import { Command } from '$commands';
import { prestigeCost } from '@/commands/fun/bananen.ts';
import { bananeStrings, BananeType } from '@/util/bananen.ts';
import { buildEmbed } from '@/lib/embeds/default-embed.ts';
import { amount, nb, priceAdjust } from '@/lib/helpers/bananen.ts';
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  Interaction,
} from 'discord.js';
import { Plantage, UpgradeResult } from '@/util/plantage.ts';

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

function maxUpgrade(
  plantage: Plantage,
  type: 'max' | 'maxbalance' | 'maxland' | 'maxmultiplier',
): UpgradeResult {
  switch (type) {
    case 'max':
      return plantage.maxAllUpgrade();
    case 'maxbalance':
      return plantage.maxAllUpgradeBalanced();
    case 'maxland':
      return plantage.maxLandUpgrade();
    case 'maxmultiplier':
      return plantage.maxMultiplierUpgrade();
  }
}

export default new Command(
  'plantage',
  'Pflanze deine eigenen Bananen an!',
  async (interaction) => {
    const user = interaction.options.getUser('user', false) || interaction.user;

    const plantage = new Plantage(user.id);
    const singleItem = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel('\u2922 Land kaufen')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('land'),
      new ButtonBuilder()
        .setLabel(
          String.fromCharCode(0x2776 + Math.floor(Math.random() * 10)) +
            ' Multiplikator kaufen',
        )
        .setStyle(ButtonStyle.Primary)
        .setCustomId('multiplier'),
      new ButtonBuilder()
        .setLabel('1x')
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('switchtomax'),
    );
    const maxItem = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel('\u2922 Land kaufen')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('maxland'),
      new ButtonBuilder()
        .setLabel(
          String.fromCharCode(0x2776 + Math.floor(Math.random() * 10)) +
            ' Multiplikator kaufen',
        )
        .setStyle(ButtonStyle.Primary)
        .setCustomId('maxmultiplier'),
      new ButtonBuilder()
        .setLabel('MAX')
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('switchtoall'),
    );
    const allItem = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel(
          String.fromCodePoint(0x1f4b4 + Math.floor(Math.random() * 4)) +
            ' nach Preis',
        )
        .setStyle(ButtonStyle.Primary)
        .setCustomId('max'),
      new ButtonBuilder()
        .setLabel('\u2696\ufe0f mit Balancing')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('maxbalance'),
      new ButtonBuilder()
        .setLabel('Alles')
        .setStyle(ButtonStyle.Secondary)
        .setCustomId('switchtosingle'),
    );

    const embed = () =>
      buildEmbed(
        'Plantage von @' + user.username,
        plantage.plantage.land < 1
          ? 'Dieser Nutzer hat noch kein Land für seine Plantage gekauft.\nNutze den Knopf unten, um 1m² Land zu kaufen.'
          : `**Ertrag/min:** \`${amount(plantage.earnings())}\` ${bananeStrings(BananeType.Geerntet)[1]}`,
        [
          [
            `Land: \`${plantage.plantage.land}m²\``,
            `Nächster Kauf: \`${nb(landPrice(plantage.plantage.land))}\``,
          ],
          [
            `Multiplikator: \`${plantage.plantage.multiplier}x\``,
            `Nächster Kauf: \`${nb(multiplierPrice(plantage.plantage.multiplier))}\``,
          ],
          plantage.prestige > 0 && [
            `Prestige-Bonus: \`${plantage.prestige * 200}%\``,
            `Nächstes Prestige-Level: \`${nb(prestigeCost(plantage.prestige))}\``,
          ],
        ].filter(Boolean) as [string, string][],
        null,
      );

    const msg = await interaction.reply({
      embeds: [await embed()],
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
            if (!plantage.landUpgrade()) {
              await action?.reply({
                content: `-# <@${user.id}>\nDu hast nicht genug Bananen, um mehr Land zu kaufen! Der Preis für das nächste Land beträgt \`${nb(landPrice(plantage.plantage.land))}\`.`,
                ephemeral: true,
              });
              return;
            }
            const spentLand = landPrice(plantage.plantage.land - 1);
            await interaction.editReply({
              embeds: [await embed()],
            });
            await action?.reply(
              `-# <@${user.id}>\nDu hast erfolgreich 1m² Land für deine Plantage gekauft! Deine Plantage hat jetzt eine Fläche von **${
                plantage.plantage.land
              }m²**.\n\n-# Du hast \`${nb(spentLand)}\` für dieses Upgrade ausgegeben.`,
            );
            break;
          case 'multiplier':
            if (!plantage.multiplierUpgrade()) {
              await action?.reply({
                content: `-# <@${user.id}>\nDu hast nicht genug Bananen, um den Multiplikator zu erhöhen! Der Preis für den nächsten Multiplikator beträgt \`${nb(multiplierPrice(plantage.plantage.multiplier))}\`.`,
                ephemeral: true,
              });
              return;
            }
            const spentMultiplier = multiplierPrice(
              plantage.plantage.multiplier - 1,
            );
            await interaction.editReply({
              embeds: [await embed()],
            });
            await action?.reply(
              `-# <@${user.id}>\nDu hast erfolgreich den Multiplikator deiner Plantage erhöht! Deine Plantage hat jetzt einen Multiplikator von **${
                plantage.plantage.multiplier
              }x**.\n\n-# Du hast \`${nb(spentMultiplier)}\` für dieses Upgrade ausgegeben.`,
            );
            break;
          case 'max':
          case 'maxbalance':
          case 'maxland':
          case 'maxmultiplier':
            const { multiplier, land, spent } = maxUpgrade(
              plantage,
              action.customId as any,
            );
            await interaction.editReply({
              embeds: [await embed()],
            });
            await action?.reply(
              `-# <@${user.id}>\nDu hast erfolgreich ` +
                (multiplier > 0 ? `\`${multiplier}x\` Multiplikator` : '') +
                (multiplier > 0 && land > 0 ? ` und ` : '') +
                (land > 0 ? `\`${land}m²\` Land` : '') +
                ` gekauft!\n` +
                (multiplier > 0
                  ? `\nDeine Plantage hat jetzt einen Multiplikator von **${
                      plantage.plantage.multiplier
                    }x**.`
                  : '') +
                (land > 0
                  ? `\nDeine Plantage hat jetzt eine Fläche von **${
                      plantage.plantage.land
                    }m²**.`
                  : 0) +
                `\n\n-# Du hast \`${nb(spent)}\` für diese Upgrades ausgegeben.`,
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
