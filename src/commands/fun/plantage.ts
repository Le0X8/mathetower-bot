import { Command } from '$commands';
import { prestigeCost } from '@/commands/fun/bananen.ts';
import { bananeStrings, BananeType } from '@/api/bananen.ts';
import { buildEmbed } from '@/lib/embeds/default-embed.ts';
import { amount, nb, priceAdjust } from '@/lib/helpers/bananen.ts';
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  Interaction,
} from 'discord.js';
import { Plantage, UpgradeResult } from '@/api/plantage.ts';
import { setMutation } from '$commands/fun/mutation.ts';

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

const amount2 = (a: number) =>
  a < 1e10
    ? a.toLocaleString('de-DE')
    : a.toExponential(2).replace(/e\+?/, 'e');

export default new Command(
  'plantage',
  'Pflanze deine eigenen Bananen an!',
  async (interaction) => {
    if (interaction.options.getInteger('use', false)) {
      if (
        setMutation(
          interaction.user.id,
          interaction.options.getInteger('use', true),
        )
      ) {
        await interaction.reply({
          content: `Du hast erfolgreich eine mutierte Bananensorte auf deiner Plantage gepflanzt! Dein Multiplikator wurde zurückgesetzt.\n\nNutze \`/mutation info:0\`, um die aktivierte Banane zu sehen.`,
        });
      } else {
        await interaction.reply({
          content: `Du hast diese mutierte Bananensorte nicht in deinem Labor-Inventar!`,
          ephemeral: true,
        });
      }
      return;
    }

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
        'Plantage von @' + user.username.replaceAll('_', '\_'),
        plantage.plantage.land < 1
          ? 'Dieser Nutzer hat noch kein Land für seine Plantage gekauft.\nNutze den Knopf unten, um 1m² Land zu kaufen.'
          : `**Ertrag/min:** \`${amount(plantage.earnings())}\` ${bananeStrings(BananeType.Geerntet)[1]}`,
        [
          [
            `Land: \`${amount2(plantage.plantage.land)}m²\``,
            `Nächster Kauf: \`${nb(plantage.landCost())}\``,
          ],
          [
            `Multiplikator: \`${amount2(plantage.plantage.multiplier)}x\``,
            `Nächster Kauf: \`${nb(plantage.multiplierCost())}\``,
          ],
          plantage.prestige > 0 && [
            `Prestige-Bonus: \`${plantage.prestige * 50}%\``,
            `Nächstes Prestige-Level: \`${nb(prestigeCost(plantage.prestige))}\``,
          ],
        ].filter(Boolean) as [string, string][],
        plantage.plantage.infection
          ? `⚠️ Deine Plantage ist zu ${plantage.plantage.infection}% infiziert!`
          : null,
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

        console.error('plantageupgrade', interaction.user.id, action?.customId);
        switch (action?.customId) {
          case 'land':
            if (!plantage.landUpgrade()) {
              await action?.reply({
                content: `-# <@${user.id}>\nDu hast nicht genug Bananen, um mehr Land zu kaufen! Der Preis für das nächste Land beträgt \`${nb(plantage.landCost())}\`.`,
                ephemeral: true,
              });
              return;
            }
            await interaction.editReply({
              embeds: [await embed()],
            });
            await action?.reply(
              `-# <@${user.id}>\nDu hast erfolgreich 1m² Land für deine Plantage gekauft! Deine Plantage hat jetzt eine Fläche von **${amount2(
                plantage.plantage.land,
              )}m²**.`,
            );
            break;
          case 'multiplier':
            if (!plantage.multiplierUpgrade()) {
              await action?.reply({
                content: `-# <@${user.id}>\nDu hast nicht genug Bananen, um den Multiplikator zu erhöhen! Der Preis für den nächsten Multiplikator beträgt \`${nb(plantage.multiplierCost())}\`.`,
                ephemeral: true,
              });
              return;
            }
            await interaction.editReply({
              embeds: [await embed()],
            });
            await action?.reply(
              `-# <@${user.id}>\nDu hast erfolgreich den Multiplikator deiner Plantage erhöht! Deine Plantage hat jetzt einen Multiplikator von **${amount2(
                plantage.plantage.multiplier,
              )}x**.`,
            );
            break;
          case 'max':
          case 'maxbalance':
          case 'maxland':
          case 'maxmultiplier':
            const { multiplier, land, spent, remaining } = maxUpgrade(
              plantage,
              action.customId as any,
            );
            if (remaining === -1) {
              await action?.reply({
                content: `-# <@${user.id}>\nDu musst zuerst prestigen, bevor du weitere Upgrades durchführen kannst!`,
                ephemeral: true,
              });
              await interaction.editReply({
                components: [],
              });
              return;
            }
            await interaction.editReply({
              embeds: [await embed()],
            });
            await action?.reply(
              `-# <@${user.id}>\nDu hast erfolgreich ` +
                (multiplier > 0
                  ? `\`${amount2(multiplier)}x\` Multiplikator`
                  : '') +
                (multiplier > 0 && land > 0 ? ` und ` : '') +
                (land > 0 ? `\`${amount2(land)}m²\` Land` : '') +
                ` gekauft!\n` +
                (multiplier > 0
                  ? `\nDeine Plantage hat jetzt einen Multiplikator von **${amount2(
                      plantage.plantage.multiplier,
                    )}x**.`
                  : '') +
                (land > 0
                  ? `\nDeine Plantage hat jetzt eine Fläche von **${amount2(
                      plantage.plantage.land,
                    )}m²**.`
                  : '') +
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
    {
      name: 'use',
      description: 'Pflanze eine mutierte Bananensorte!',
      type: ApplicationCommandOptionType.Integer,
      required: false,
    },
  ],
);
