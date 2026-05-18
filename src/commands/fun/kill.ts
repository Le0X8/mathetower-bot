import { Command } from '$commands';
import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { join } from 'node:path';

const colorT = '#fbbf24';
const colorCT = '#60a5fa';

const weapons: Record<string, string> = {
  AWP: '\ue007',
  Karambit: '\ue048',
};

export default new Command(
  'kill',
  'tötet jemanden',
  async (interaction) => {
    const colorRng = Math.floor(Math.random() * 16);
    const source =
      (interaction.member as GuildMember).nickname ??
      interaction.user.globalName ??
      interaction.user.username;
    const target =
      (interaction.member as GuildMember)?.guild.members.cache.get(
        interaction.options.getUser('target', true).id,
      )?.nickname ??
      interaction.options.getUser('target', true).globalName ??
      interaction.options.getUser('target', true).username ??
      source;
    const assist =
      (interaction.member as GuildMember)?.guild.members.cache.get(
        interaction.options.getUser('assist', false)?.id ?? '',
      )?.nickname ??
      interaction.options.getUser('assist', false)?.globalName ??
      interaction.options.getUser('assist', false)?.username;

    const weaponList = Object.keys(weapons);
    const weapon =
      interaction.options.getString('weapon', false) ??
      weapons[weaponList[Math.floor(Math.random() * weaponList.length)]];

    GlobalFonts.registerFromPath(join('media', 'stratum2.woff2'), 'Stratum2');
    GlobalFonts.registerFromPath(join('media', 'CS2EquipmentIcons.ttf'), 'CS2');
    GlobalFonts.registerFromPath(
      join('media', 'NotoSansCondensed.ttf'),
      'NotoSansCondensed',
    );
    GlobalFonts.registerFromPath(
      join('media', 'DejaVuSansCondensed.ttf'),
      'DejaVuSansCondensed',
    );
    const measureCanvas = createCanvas(0, 0);
    const measureContext = measureCanvas.getContext('2d');
    measureContext.font =
      '30px Stratum2, NotoSansCondensed, DejaVuSansCondensed';
    const sourceWidth = Math.ceil(measureContext.measureText(source).width);
    const plusWidth = assist
      ? Math.ceil(measureContext.measureText('  +  ').width)
      : 0;
    const assistWidth = assist
      ? Math.ceil(measureContext.measureText(assist).width)
      : 0;
    const targetWidth = Math.ceil(measureContext.measureText(target).width);
    measureContext.font = '45px CS2';
    const weaponWidth = Math.ceil(measureContext.measureText(weapon).width);

    const boxWidth =
      50 +
      sourceWidth +
      20 +
      weaponWidth +
      20 +
      targetWidth +
      50 +
      plusWidth +
      assistWidth;
    const canvas = createCanvas(boxWidth > 1000 ? boxWidth : 1000, 60);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(30, 0, boxWidth - 60, canvas.height);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(33, 3, boxWidth - 66, canvas.height - 6);

    ctx.font = '30px Stratum2, NotoSansCondensed, DejaVuSansCondensed';
    ctx.fillStyle = colorRng % 2 == 0 ? colorT : colorCT;
    ctx.fillText(source, 50, 40);
    if (colorRng < 14) ctx.fillStyle = colorRng % 2 == 0 ? colorCT : colorT;
    ctx.fillText(
      target,
      50 + sourceWidth + 20 + weaponWidth + 20 + plusWidth + assistWidth,
      40,
    );
    if (colorRng < 8) ctx.fillStyle = colorRng % 2 == 0 ? colorCT : colorT;
    if (assist) ctx.fillText(assist, 50 + sourceWidth + plusWidth, 40);

    ctx.fillStyle = '#f8fafc';
    if (assist) ctx.fillText('  +  ', 50 + sourceWidth, 40);
    ctx.font = '45px CS2';
    ctx.fillText(weapon, 50 + sourceWidth + 20 + plusWidth + assistWidth, 45);

    await interaction.reply({
      files: [
        {
          contentType: 'image/png',
          attachment: canvas.toBuffer('image/png'),
          width: canvas.width,
          name: 'kill.png',
        },
      ],
    });
  },
  false,
  [
    {
      name: 'target',
      description: 'die Person die du töten willst',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: 'assist',
      description: 'die Person die assisted',
      type: ApplicationCommandOptionType.User,
      required: false,
    },
    {
      name: 'weapon',
      description: 'die Waffe mit der getötet wird',
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: Object.entries(weapons).map(([name, value]) => ({
        name,
        value,
      })),
    },
  ],
);
