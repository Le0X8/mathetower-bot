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
  'Butterfly Knife': '\ue026',
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

function useFont(name: string, ext: string = 'ttf') {
  GlobalFonts.registerFromPath(join('media', name + '.' + ext), name);
}

useFont('stratum2', 'woff2');
useFont('CS2EquipmentIcons');
useFont('NotoSansCondensed');
useFont('DejaVuSansCondensed');
useFont('STIXTwoMath');

const textFont =
  'stratum2, NotoSansCondensed, DejaVuSansCondensed, STIXTwoMath';
const weaponFont = 'CS2EquipmentIcons';

function isSniper(weapon: string): boolean {
  return (
    weapon === weapons['AWP'] ||
    weapon === weapons['SSG 08'] ||
    weapon === weapons['SCAR-20'] ||
    weapon === weapons['G3SG1']
  );
}

function hasBullets(weapon: string): boolean {
  return !(
    weapon === weapons['Incendiary Grenade'] ||
    weapon === weapons['Zeus x27'] ||
    weapon === weapons['Decoy Grenade'] ||
    weapon === weapons['HE Grenade'] ||
    weapon === weapons['Molotov'] ||
    weapon === weapons['Flashbang'] ||
    weapon === weapons['Smoke Grenade'] ||
    weapon === weapons['Knife (CT)'] ||
    weapon === weapons['Knife (T)'] ||
    weapon === weapons['Bajonet'] ||
    weapon === weapons['Bone Knife'] ||
    weapon === weapons['Butterfly Knife'] ||
    weapon === weapons['Classic Knife'] ||
    weapon === weapons['Flip Knife'] ||
    weapon === weapons['Gut Knife'] ||
    weapon === weapons['Huntsman Knife'] ||
    weapon === weapons['Karambit'] ||
    weapon === weapons['M9 Bayonet'] ||
    weapon === weapons['Navaja Knife'] ||
    weapon === weapons['Nomad Knife'] ||
    weapon === weapons['Paracord Knife'] ||
    weapon === weapons['Skeleton Knife'] ||
    weapon === weapons['Stiletto Knife'] ||
    weapon === weapons['Survival Knife'] ||
    weapon === weapons['Talon Knife'] ||
    weapon === weapons['Ursus Knife']
  );
}

const measureCanvas = createCanvas(0, 0);
const measureContext = measureCanvas.getContext('2d');
function textWidth(
  font: string,
  height: number,
  ...text: (string | undefined)[]
): number[] {
  measureContext.font = height + 'px ' + font;
  return text.map((t) =>
    t ? Math.ceil(measureContext.measureText(t).width) : 0,
  );
}

function killIcon(icon: string) {
  return loadImage(join('media', 'kill-icons', icon + '.svg'));
}

class KillfeedBuilder {
  #source: string;
  #target: string;
  #weapon: string;
  #assist?: string;
  #airborne: boolean;
  #headshot: boolean;
  #noscope?: boolean;
  #smoke: boolean;
  #wallbang: boolean;
  #blinded: boolean;
  #flashassist: boolean;

  constructor(source: string, target: string) {
    this.#source = source.slice(0, 50);
    this.#target = target.slice(0, 50);
    this.#airborne = Math.floor(Math.random() * 20) === 0;
    this.#headshot = Math.floor(Math.random() * 3) === 0;
    this.#smoke = Math.floor(Math.random() * 20) === 0;
    this.#wallbang = Math.floor(Math.random() * 20) === 0;
    this.#blinded = Math.floor(Math.random() * 40) === 0;
    this.#flashassist = Math.floor(Math.random() * 10) === 0;
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

  smoke(smoke?: boolean) {
    if (smoke !== undefined) this.#smoke = smoke;
    return this;
  }

  wallbang(wallbang?: boolean) {
    if (wallbang !== undefined) this.#wallbang = wallbang;
    return this;
  }

  blinded(blinded?: boolean) {
    if (blinded !== undefined) this.#blinded = blinded;
    return this;
  }

  flashassist(flashassist?: boolean) {
    if (flashassist !== undefined) this.#flashassist = flashassist;
    return this;
  }

  async render() {
    this.#noscope = isSniper(this.#weapon)
      ? (this.#noscope ?? Math.floor(Math.random() * 50) === 0)
      : false;
    const hasNoBullets = !hasBullets(this.#weapon);
    const suicide = this.#source === this.#target;

    const suicideImage = suicide
      ? await loadImage(join('media', 'kill-icons', 'icon_suicide.svg'))
      : null;

    const height = 60;
    const inner = (height * 5) / 6;
    const gap = height / 3;
    const smallGap = height / 12;
    const ringX = height / 2;
    const ringWidth = ringX / 10;
    const imgHeight = (height * 3) / 4;
    const imgY = ringWidth + smallGap;
    const textHeight = height / 2;
    const textY = textHeight + ringWidth + height / 10;
    const weaponWidth = suicide
      ? (imgHeight * 33) / 32
      : textWidth(weaponFont, imgHeight, this.#weapon)[0];

    const [sourceWidth, plusWidth, assistWidth, targetWidth] = textWidth(
      textFont,
      textHeight,
      this.#source,
      this.#assist ? '  +  ' : undefined,
      this.#assist,
      this.#target,
    );

    const blindedImage =
      this.#blinded && !suicide ? await killIcon('blind_kill') : null;
    const flashassistImage =
      this.#flashassist && !suicide && this.#assist
        ? await killIcon('flashbang_assist')
        : null;
    const airborneImage =
      this.#airborne && !suicide ? await killIcon('inairkill') : null;
    const noscopeImage =
      this.#noscope && !suicide && !hasNoBullets
        ? await killIcon('noscope')
        : null;
    const smokeImage =
      this.#smoke && !suicide && !hasNoBullets
        ? await killIcon('smoke_kill')
        : null;
    const wallbangImage =
      this.#wallbang && !suicide && !hasNoBullets
        ? await killIcon('penetrate')
        : null;
    const headshotImage =
      this.#noscope && !suicide && !hasNoBullets
        ? await killIcon('icon_headshot')
        : null;

    const blindedWidth = blindedImage ? imgHeight + smallGap : 0;
    const flashassistWidth = flashassistImage ? imgHeight + smallGap : 0;
    const airborneWidth = airborneImage ? imgHeight - ringWidth : 0;
    const noscopeWidth = noscopeImage ? imgHeight + smallGap : 0;
    const smokeWidth = smokeImage ? imgHeight + smallGap : 0;
    const wallbangWidth = wallbangImage ? imgHeight + smallGap : 0;
    const headshotWidth = headshotImage ? imgHeight + smallGap : 0;

    const contentX = ringX + ringWidth;
    const blindedX = inner - smallGap;
    const sourceX = blindedX + smallGap + blindedWidth;
    const plusX = sourceX + sourceWidth;
    const flashassistX = plusX + plusWidth - smallGap;
    const assistX = flashassistX + flashassistWidth + smallGap;
    const airborneX = assistX + assistWidth + (airborneImage ? smallGap : gap);
    const weaponX = airborneX + airborneWidth;
    const noscopeX = weaponX + weaponWidth + gap - smallGap;
    const smokeX = noscopeX + noscopeWidth;
    const wallbangX = smokeX + smokeWidth;
    const headshotX = wallbangX + wallbangWidth;
    const targetX = headshotX + headshotWidth + smallGap;

    const width = targetX + targetWidth + inner;

    const canvas = createCanvas(
      width > 20 * inner ? width : 20 * inner,
      height,
    );
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(ringX, 0, width - ringX * 2, canvas.height);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(
      contentX,
      ringWidth,
      width - contentX * 2,
      canvas.height - ringWidth * 2,
    );

    if (blindedImage)
      ctx.drawImage(blindedImage, blindedX, imgY, imgHeight, imgHeight);

    ctx.font = textHeight + 'px ' + textFont;
    const sourceT = Math.floor(Math.random() * 2) === 0;
    ctx.fillStyle = sourceT ? colorT : colorCT;
    ctx.fillText(this.#source, sourceX, textY);
    if (Math.floor(Math.random() * 20) !== 0 && this.#target != this.#source)
      ctx.fillStyle = sourceT ? colorCT : colorT;

    if (noscopeImage)
      ctx.drawImage(noscopeImage, noscopeX, imgY, imgHeight, imgHeight);
    if (smokeImage)
      ctx.drawImage(smokeImage, smokeX, imgY, imgHeight, imgHeight);
    if (wallbangImage)
      ctx.drawImage(wallbangImage, wallbangX, imgY, imgHeight, imgHeight);
    if (headshotImage)
      ctx.drawImage(headshotImage, headshotX, imgY, imgHeight, imgHeight);

    ctx.fillText(this.#target, targetX, textY);
    if (Math.floor(Math.random() * 10) !== 0)
      ctx.fillStyle = sourceT ? colorT : colorCT;
    if (flashassistImage)
      ctx.drawImage(flashassistImage, flashassistX, imgY, imgHeight, imgHeight);

    if (this.#assist) ctx.fillText(this.#assist, assistX, textY);

    ctx.fillStyle = '#f8fafc';
    if (this.#assist) ctx.fillText('  +  ', plusX, textY);
    if (suicideImage) {
      ctx.drawImage(suicideImage, weaponX, imgY, weaponWidth, imgHeight);
    } else {
      if (airborneImage) {
        ctx.save();
        const rotation = (5 * Math.PI) / 180;
        const x = airborneX;
        const y = smallGap * 2;
        ctx.translate(x + imgHeight / 2, y + imgHeight / 2);
        ctx.rotate(rotation);
        ctx.drawImage(
          airborneImage,
          -((height * 23) / 60),
          -((height * 38) / 60),
          imgHeight,
          imgHeight,
        );
        ctx.restore();
      }
      ctx.font = imgHeight + 'px ' + weaponFont;
      ctx.fillText(this.#weapon, weaponX, imgHeight);
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
      (interaction.member as GuildMember)?.guild.members.cache.get(
        interaction.options.getUser('source', false)?.id ?? '',
      )?.nickname ??
      interaction.options.getUser('source', false)?.globalName ??
      interaction.options.getUser('source', false)?.username ??
      (interaction.member as GuildMember).nickname ??
      interaction.user.globalName ??
      interaction.user.username;
    const target =
      interaction.options.getString('customtarget', false) ??
      (interaction.member as GuildMember)?.guild.members.cache.get(
        interaction.options.getUser('target', false)?.id ?? '',
      )?.nickname ??
      interaction.options.getUser('target', false)?.globalName ??
      interaction.options.getUser('target', false)?.username ??
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
      .noscope(interaction.options.getBoolean('noscope', false) ?? undefined)
      .smoke(interaction.options.getBoolean('smoke', false) ?? undefined)
      .wallbang(interaction.options.getBoolean('wallbang', false) ?? undefined)
      .blinded(interaction.options.getBoolean('blinded', false) ?? undefined)
      .flashassist(
        interaction.options.getBoolean('flashassist', false) ?? undefined,
      );

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
      required: false,
    },
    {
      name: 'source',
      description: 'die Person die tötet',
      type: ApplicationCommandOptionType.User,
      required: false,
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
      name: 'smoke',
      description: 'ob es ein Smoke Kill sein soll',
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
    {
      name: 'wallbang',
      description: 'ob es ein Wallbang Kill sein soll',
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
    {
      name: 'blinded',
      description: 'ob es ein Blinded Kill sein soll',
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
    {
      name: 'flashassist',
      description: 'ob es ein Flash Assist Kill sein soll',
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
