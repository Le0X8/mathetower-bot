import { Command } from '$commands';
import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import { createCanvas, GlobalFonts, Image, loadImage } from '@napi-rs/canvas';
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
  P90: '\ue035',
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

const goodWeapons: Record<string, string> = {
  'AK-47': weapons['AK-47'],
  AWP: weapons['AWP'],
  'Desert Eagle': weapons['Desert Eagle'],
  'Dual Berettas': weapons['Dual Berettas'],
  FAMAS: weapons['FAMAS'],
  'Five-SeveN': weapons['Five-SeveN'],
  'Galil AR': weapons['Galil AR'],
  'Glock-18': weapons['Glock-18'],
  'Knife (CT)': weapons['Knife (CT)'],
  'Knife (T)': weapons['Knife (T)'],
  'M4A1-S': weapons['M4A1-S'],
  M4A4: weapons['M4A4'],
  'MAC-10': weapons['MAC-10'],
  'MP5-SD': weapons['MP5-SD'],
  MP7: weapons['MP7'],
  MP9: weapons['MP9'],
  P90: weapons['P90'],
  Negev: weapons['Negev'],
  Nova: weapons['Nova'],
  'SG 553': weapons['SG 553'],
  'SSG 08': weapons['SSG 08'],
  'Tec-9': weapons['Tec-9'],
  'UMP-45': weapons['UMP-45'],
  'USP-S': weapons['USP-S'],
  XM1014: weapons['XM1014'],
};

class KillfeedBuilder {
  #source: string;
  #target: string;
  #weapon: string;
  #assist?: string;
  #airborne: boolean;
  #headshot: boolean;
  #noscope?: boolean;

  constructor(source: string, target: string) {
    this.#source = source.slice(0, 50);
    this.#target = target.slice(0, 50);
    this.#airborne = Math.floor(Math.random() * 20) === 0;
    this.#headshot = Math.floor(Math.random() * 20) === 0;
    const weaponList = Object.keys(goodWeapons);
    this.#weapon =
      weapons[weaponList[Math.floor(Math.random() * weaponList.length)]];
  }

  assist(assist?: string) {
    if (assist) this.#assist = assist.slice(0, 50);
    return this;
  }

  weapon(weapon?: string) {
    if (weapon) this.#weapon = weapon;
    return this;
  }

  airborne(airborne?: boolean) {
    if (airborne !== undefined) this.#airborne = airborne;
    return this;
  }

  headshot(headshot?: boolean) {
    if (headshot !== undefined) this.#headshot = headshot;
    return this;
  }

  noscope(noscope?: boolean) {
    if (noscope !== undefined) this.#noscope = noscope;
    return this;
  }

  async render() {
    const isSniper =
      this.#weapon === weapons['AWP'] ||
      this.#weapon === weapons['SSG 08'] ||
      this.#weapon === weapons['SCAR-20'] ||
      this.#weapon === weapons['G3SG1'];
    this.#noscope = isSniper
      ? (this.#noscope ?? Math.floor(Math.random() * 50) === 0)
      : false;

    const inner = 50;
    const gap = 20;

    GlobalFonts.registerFromPath(join('media', 'stratum2.woff2'), 'Stratum2');
    if (this.#source !== this.#target)
      GlobalFonts.registerFromPath(
        join('media', 'CS2EquipmentIcons.ttf'),
        'CS2',
      );
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
    const sourceWidth = Math.ceil(
      measureContext.measureText(this.#source).width,
    );
    const plusWidth = this.#assist
      ? Math.ceil(measureContext.measureText('  +  ').width)
      : 0;
    const assistWidth = this.#assist
      ? Math.ceil(measureContext.measureText(this.#assist).width)
      : 0;
    const targetWidth = Math.ceil(
      measureContext.measureText(this.#target).width,
    );

    let weaponWidth: number;
    let suicideImage: Image | null = null;
    if (this.#source === this.#target) {
      suicideImage = await loadImage(
        join('media', 'kill-icons', 'icon_suicide.svg'),
      );
      weaponWidth = (45 / 32) * 33;
    } else {
      measureContext.font = '45px CS2';
      weaponWidth = Math.ceil(measureContext.measureText(this.#weapon).width);
    }
    let gapLeft = gap;

    let airborneWidth = 0;
    let airborneImage: Image | null = null;
    if (this.#airborne) {
      airborneImage = await loadImage(
        join('media', 'kill-icons', 'inairkill.svg'),
      );
      airborneWidth = 42;
      gapLeft = 5;
    }

    let noscopeWidth = 0;
    let noscopeImage: Image | null = null;
    if (this.#noscope && !suicideImage) {
      noscopeImage = await loadImage(
        join('media', 'kill-icons', 'noscope.svg'),
      );
      noscopeWidth = 50;
    }

    let headshotWidth = 0;
    let headshotImage: Image | null = null;
    if (this.#headshot && !suicideImage) {
      headshotImage = await loadImage(
        join('media', 'kill-icons', 'icon_headshot.svg'),
      );
      headshotWidth = 50;
    }

    if (suicideImage) {
      headshotWidth = 0;
      noscopeWidth = 0;
      airborneWidth = 0;
      gapLeft = gap;
    }

    const boxWidth =
      inner +
      sourceWidth +
      gapLeft +
      weaponWidth +
      gap +
      headshotWidth +
      targetWidth +
      inner +
      plusWidth +
      noscopeWidth +
      assistWidth +
      airborneWidth;

    const canvas = createCanvas(boxWidth > 1000 ? boxWidth : 1000, 60);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(30, 0, boxWidth - 60, canvas.height);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(33, 3, boxWidth - 66, canvas.height - 6);

    ctx.font =
      '30px Stratum2, NotoSansCondensed, DejaVuSansCondensed, STIXTwoMath';
    const sourceT = Math.floor(Math.random() * 2) === 0;
    ctx.fillStyle = sourceT ? colorT : colorCT;
    ctx.fillText(this.#source, 50, 40);
    if (Math.floor(Math.random() * 20) !== 0 && this.#target != this.#source)
      ctx.fillStyle = sourceT ? colorCT : colorT;
    if (noscopeImage) {
      ctx.drawImage(
        noscopeImage,
        50 +
          sourceWidth +
          gapLeft +
          weaponWidth +
          20 +
          plusWidth +
          assistWidth +
          airborneWidth -
          5,
        8,
        45,
        45,
      );
    }
    if (headshotImage) {
      ctx.drawImage(
        headshotImage,
        50 +
          sourceWidth +
          gapLeft +
          weaponWidth +
          20 +
          plusWidth +
          assistWidth +
          noscopeWidth +
          airborneWidth -
          5,
        8,
        45,
        45,
      );
    }
    ctx.fillText(
      this.#target,
      50 +
        sourceWidth +
        gapLeft +
        weaponWidth +
        20 +
        plusWidth +
        assistWidth +
        airborneWidth +
        headshotWidth +
        noscopeWidth,
      40,
    );
    if (Math.floor(Math.random() * 10) !== 0)
      ctx.fillStyle = sourceT ? colorT : colorCT;
    if (this.#assist)
      ctx.fillText(this.#assist, 50 + sourceWidth + plusWidth, 40);

    ctx.fillStyle = '#f8fafc';
    if (this.#assist) ctx.fillText('  +  ', 50 + sourceWidth, 40);
    if (suicideImage) {
      ctx.drawImage(
        suicideImage,
        50 + sourceWidth + 20 + plusWidth + assistWidth,
        8,
        weaponWidth,
        45,
      );
    } else {
      if (airborneImage) {
        ctx.save();
        const rotation = (5 * Math.PI) / 180;
        const x = 50 + sourceWidth + gapLeft + plusWidth + assistWidth;
        const y = 10;
        ctx.translate(x + 45 / 2, y + 45 / 2);
        ctx.rotate(rotation);
        ctx.drawImage(airborneImage, -23, -38, 45, 45);
        ctx.restore();
      }
      ctx.font = '45px CS2';
      ctx.fillText(
        this.#weapon,
        50 + sourceWidth + gapLeft + plusWidth + assistWidth + airborneWidth,
        45,
      );
    }

    return {
      contentType: 'image/png',
      attachment: canvas.toBuffer('image/png'),
      width: canvas.width,
      name: `${this.#source} killed ${this.#target}.png`,
    };
  }
}

export default new Command(
  'kill',
  'tötet jemanden',
  async (interaction) => {
    const source =
      interaction.options.getString('customsource', false) ??
      (interaction.member as GuildMember).nickname ??
      interaction.user.globalName ??
      interaction.user.username;
    const target =
      interaction.options.getString('customtarget', false) ??
      (interaction.member as GuildMember)?.guild.members.cache.get(
        interaction.options.getUser('target', true).id,
      )?.nickname ??
      interaction.options.getUser('target', true).globalName ??
      interaction.options.getUser('target', true).username ??
      source;

    const killfeed = new KillfeedBuilder(source, target);

    killfeed
      .assist(
        interaction.options.getString('customassist', false) ??
          (interaction.member as GuildMember)?.guild.members.cache.get(
            interaction.options.getUser('assist', false)?.id ?? '',
          )?.nickname ??
          interaction.options.getUser('assist', false)?.globalName ??
          interaction.options.getUser('assist', false)?.username,
      )
      .weapon(
        weapons[
          interaction.options.getString('customweapon', false) ??
            interaction.options.getString('weapon', false) ??
            ''
        ],
      )
      .airborne(interaction.options.getBoolean('airborne', false) ?? undefined)
      .headshot(interaction.options.getBoolean('headshot', false) ?? undefined)
      .noscope(interaction.options.getBoolean('noscope', false) ?? undefined);

    await interaction.reply({
      files: [await killfeed.render()],
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
      choices: Object.keys(goodWeapons).map((weapon) => ({
        name: weapon,
        value: weapon,
      })),
    },
    {
      name: 'airborne',
      description: 'ob es ein Airborne Kill sein soll',
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
    {
      name: 'headshot',
      description: 'ob es ein Headshot Kill sein soll',
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
    {
      name: 'noscope',
      description: 'ob es ein Noscope Kill sein soll',
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
    {
      name: 'customweapon',
      description: 'die Waffe mit der getötet wird (überschreibt die Waffe)',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: 'customtarget',
      description: 'der Name der getötet wird (überschreibt die Ziel-Person)',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: 'customassist',
      description: 'der Name der assistiert (überschreibt die Assist-Person)',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: 'customsource',
      description: 'der Name des Killers (überschreibt dich)',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
);
