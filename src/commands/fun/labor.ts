import { Command } from '$commands';
import { buildEmbed } from '@/lib/embeds/default-embed.ts';
import { Plantage } from '@/util/plantage.ts';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Interaction,
} from 'discord.js';

function str0(researchState: number): string {
  switch (researchState) {
    case 0:
      return 'Auf deiner Plantage ist eine Krankeit ausgebrochen. Nimm Bodenproben, um den Erreger zu identifizieren.';
    case 1:
      return 'Du hast den Erreger identifiziert.\nSollte dieser Erreger bereits behandelt worden sein, kannst du andere Spieler nach einem Rezept für das Gegenmittel fragen. Wenn nicht, musst du deine eigene Forschung dazu starten.';
    case 2:
      return 'Jetzt hast du das Rezept für das Gegenmittel! Du kannst nun mit der Herstellung des Gegenmittels beginnen.\nSobald du das Gegenmittel hergestellt hast, kannst du es auf deiner Plantage anwenden, um die Infektion zu heilen.';
    case 3:
      return 'Du hast das Gegenmittel hergestellt. Du kannst es nun auf deiner Plantage anwenden, um die Infektion zu heilen.';
    case 4:
      return 'Deine Plantage ist geheilt! Du kannst nun wieder normal Bananen verdienen. Herzlichen Glückwunsch!';
    case 5:
      return 'Du hast ein Rezept für das Mittel gegen einen Erreger der gleichen Familie. Es braucht nur einige kleine Anpassungen, um es auf den Erreger deiner Plantage anzuwenden.';
    case 6:
      return 'Die Anpassungen am Rezept sind abgeschlossen. Du kannst nun das Gegenmittel herstellen und auf deiner Plantage anwenden, um die Infektion zu heilen.';
    case 7:
      return 'Du hast mit der Analyse des Erregers begonnen. Es wird einige Zeit dauern, bis du das Rezept für das Gegenmittel gefunden hast.\nIn der Zwischenzeit kannst du andere Spieler nach einem Rezept fragen, falls sie bereits Erfahrung mit diesem Erreger oder dessen Familie haben.';
    default:
      return '';
  }
}

function str1(researchState: number): string {
  switch (researchState) {
    case 0:
      return '🧪 Bodenproben nehmen';
    case 1:
      return '🧫 Erreger analysieren';
    case 2:
      return '🫙 Gegenmittel herstellen';
    case 3:
      return '💉 Gegenmittel anwenden';
    case 4:
      return '✅ Infektion geheilt';
    case 5:
      return '✏️ Rezept anpassen';
    case 6:
      return '🫙 Gegenmittel herstellen';
    case 7:
      return '';
    default:
      return '';
  }
}

function str2(researchState: number): string {
  switch (researchState) {
    case 0:
      return 'Du hast Bodenproben genommen und den Erreger identifiziert.';
    case 1:
      return (
        'Du hast die Forschung gestartet. <t:' +
        Math.round((Date.now() + 60 * 60 * 24 * 1000) / 1000) +
        ':R> wird das Rezept für das Gegenmittel fertig sein.'
      );
    case 2:
      return (
        'Du hast die Herstellung des Gegenmittels gestartet. <t:' +
        Math.round((Date.now() + 60 * 60 * 1000) / 1000) +
        ':R> wird das Gegenmittel fertig sein.'
      );
    case 3:
      return 'Du hast das Gegenmittel auf deiner Plantage angewendet. Die Infektion ist geheilt!';
    case 4:
      return 'Deine Plantage ist geheilt! Du kannst nun wieder normal Bananen verdienen. Herzlichen Glückwunsch!';
    case 5:
      return (
        'Du hast mit der Anpassung des Rezepts begonnen. <t:' +
        Math.round((Date.now() + 60 * 60 * 6 * 1000) / 1000) +
        ':R> wird das Rezept fertig sein.'
      );
    case 6:
      return (
        'Du hast die Herstellung des Gegenmittels gestartet. <t:' +
        Math.round((Date.now() + 60 * 60 * 1000) / 1000) +
        ':R> wird das Gegenmittel fertig sein.'
      );
    case 7:
      return '';
    default:
      return '';
  }
}

export default new Command(
  'labor',
  'Bekämpfe die Infektion auf deiner Plantage!',
  async (interaction) => {
    const plantage = new Plantage(interaction.user.id);
    if (plantage.plantage.infection <= 0) {
      await interaction.reply({
        content: 'Deine Plantage ist nicht infiziert :)',
        ephemeral: true,
      });
      return;
    }

    let researchState: number = store.get(interaction.user.id, 'labor') ?? 0;
    let laborLock: number = store.get(interaction.user.id, 'laborlock') ?? 0;

    if (Date.now() < laborLock) {
      await interaction.reply({
        content: `Du kannst das Labor erst wieder <t:${Math.round(
          laborLock / 1000,
        )}:R> benutzen.`,
        ephemeral: true,
      });
      return;
    }

    const embed = await buildEmbed(
      'Labor',
      str0(researchState),
      researchState > 0
        ? [
            ['**Erreger:**', `Typ \`${plantage.plantage.infectionType}\``],
            [
              '**Familie:**',
              `\`${plantage.plantage.infectionType?.slice(0, 1)}\``,
            ],
          ]
        : [],

      null,
    );

    const msg = await interaction.reply({
      embeds: [embed],
      components: str1(researchState)
        ? [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setLabel(str1(researchState))
                .setStyle(ButtonStyle.Primary),
            ),
          ]
        : [],
      withResponse: true,
    });

    const collectorFilter = (i: Interaction) =>
      i.user.id === interaction.user.id;

    try {
      const action = await msg.resource?.message?.awaitMessageComponent({
        filter: collectorFilter,
        time: 20_000, // 20 secs
      });

      switch (researchState) {
        case 0:
          researchState = 1;
          break;
        case 1:
          researchState = 2;
          store.set(
            interaction.user.id,
            'laborlock',
            Date.now() + 60 * 60 * 24 * 1000,
          );
          break;
        case 2:
          researchState = 3;
          store.set(
            interaction.user.id,
            'laborlock',
            Date.now() + 60 * 60 * 1000,
          );
          break;
        case 3:
          researchState = 4;
          plantage.plantage.infection = 0;
          plantage.plantage.infectionType = null;
          plantage.save();
          break;
        case 5:
          researchState = 6;
          store.set(
            interaction.user.id,
            'laborlock',
            Date.now() + 60 * 60 * 6 * 1000,
          );
          break;
        case 6:
          researchState = 3;
          store.set(
            interaction.user.id,
            'laborlock',
            Date.now() + 60 * 60 * 1000,
          );
          break;
        default:
          break;
      }

      store.set(interaction.user.id, 'labor', researchState);
      await msg.resource?.message?.reply(str2(researchState));

      await interaction.editReply({
        components: [],
      });
    } catch {
      await interaction.editReply({
        components: [],
      });
    }
  },
);
