import { Command } from '$commands';
import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { join } from 'node:path';

const colorT = '#fbbf24';
const colorCT = '#60a5fa';

const weapons: Record<string, string> = {
  'AK-47': '\ue008',
  AUG: '\ue060',
  AWP: '\ue007',
  Bajonet: '\ue014',
  'Bowie Knife': '\ue052',
  'Classic Knife': '\ue04c',
  'CZ75-Auto': '\ue02b',
  'Decoy Grenade': '\ue028',
  'Desert Eagle': '\ue04a',
  'Dual Berettas': '\ue056',
  'Falchion Knife': '\ue013',
  FAMAS: '\ue025',
  Fire: '\ue016',
  'Five-SeveN': '\ue03a',
  Flashbang: '\ue05e',
  'Flip Knife': '\ue01c',
  G3SG1: '\ue04b',
  'Galil AR': '\ue000',
  'Glock-18': '\ue023',
  'Gut Knife': '\ue041',
  'HE Grenade': '\ue00b',
  'Huntsman Knife': '\ue010',
  'Incendiary Grenade': '\ue01a',
  Karambit: '\ue048',
  'Knife (CT)': '\ue044',
  'Knife (T)': '\ue045',
  'Kukri Knife': '\ue02f',
  M249: '\ue055',
  M4A1: '\ue05c',
  'M4A1-S': '\ue015',
  M4A4: '\ue042',
  'M9 Bayonet': '\ue030',
  'MAC-10': '\ue049',
  'MAG-7': '\ue032',
  Molotov: '\ue024',
  'MP5-SD': '\ue039',
  MP7: '\ue047',
  MP9: '\ue040',
  'Navaja Knife': '\ue011',
  Negev: '\ue019',
  'Nomad Knife': '\ue058',
  Nova: '\ue02d',
  P250: '\ue04f',
  P90: '\ue0e5',
  'Paracord Knife': '\ue05d',
  'PP-Bizon': '\ue00c',
  'R8 Revolver': '\ue003',
  'Sawed-Off': '\ue031',
  'SCAR-20': '\ue009',
  'SG 553': '\ue00d',
  'Shadow Daggers': '\ue046',
  'Skeleton Knife': '\ue005',
  'Smoke Grenade': '\ue02e',
  'SSG 08': '\ue03e',
  'Stiletto Knife': '\ue054',
  'Survival Knife': '\ue002',
  'Talon Knife': '\ue004',
  'Tec-9': '\ue00e',
  'UMP-45': '\ue01f',
  'Ursus Knife': '\ue03c',
  USP: '\ue053',
  'USP-S': '\ue037',
  XM1014: '\ue01d',
  'Zeus x27': '\ue021',
};

export default new Command(
  'kill',
  'tötet jemanden',
  async (interaction) => {
    const colorRng = Math.floor(Math.random() * 16);
    const source =
      interaction.options.getString('customSource', false) ??
      (interaction.member as GuildMember).nickname ??
      interaction.user.globalName ??
      interaction.user.username;
    const target =
      interaction.options.getString('customTarget', false) ??
      (interaction.member as GuildMember)?.guild.members.cache.get(
        interaction.options.getUser('target', true).id,
      )?.nickname ??
      interaction.options.getUser('target', true).globalName ??
      interaction.options.getUser('target', true).username ??
      source;
    const assist =
      interaction.options.getString('customAssist', false) ??
      (interaction.member as GuildMember)?.guild.members.cache.get(
        interaction.options.getUser('assist', false)?.id ?? '',
      )?.nickname ??
      interaction.options.getUser('assist', false)?.globalName ??
      interaction.options.getUser('assist', false)?.username;

    const weaponList = Object.keys(weapons);
    const weapon =
      weapons[interaction.options.getString('weapon', false) ?? ''] ??
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
    GlobalFonts.registerFromPath(
      join('media', 'STIXTwoMath.ttf'),
      'STIXTwoMath',
    );
    const measureCanvas = createCanvas(0, 0);
    const measureContext = measureCanvas.getContext('2d');
    measureContext.font =
      '30px Stratum2, NotoSansCondensed, DejaVuSansCondensed, STIXTwoMath';
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

    ctx.font =
      '30px Stratum2, NotoSansCondensed, DejaVuSansCondensed, STIXTwoMath';
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
    },
    {
      name: 'customTarget',
      description: 'der Name der getötet wird (überschreibt die Ziel-Person)',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: 'customAssist',
      description: 'der Name der assistiert (überschreibt die Assist-Person)',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: 'customSource',
      description: 'der Name des Killers (überschreibt dich)',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
);
