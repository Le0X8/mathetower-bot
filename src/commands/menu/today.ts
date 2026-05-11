import { embed } from '@/helpers/message.ts';
import { Message } from 'discord.js';

const mensa = 341;
const foodfak = 474;
const galerie = 451;

const typeEmojis: Record<string, string> = {
  F: '🐟', // mit Fisch
  N: '🌱', // vegan
  G: '🐔', // mit Geflügel
  R: '🐄', // mit Rind
  S: '🐖', // mit Schwein
  V: '🥪', // vegetarisch
};

async function getMenu(id: number, filter: string[] = []) {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  const mensaMenu = await (
    await fetch(
      'https://mobil.itmc.tu-dortmund.de/canteen-menu/v3/canteens/' + id,
    )
  ).json();

  return mensaMenu[todayString]
    .filter((meal: any) =>
      meal.type.some((t: string) => filter.includes(t) || filter.length === 0),
    )
    .sort((a: any, b: any) => a.title.de.localeCompare(b.title.de))
    .map((meal: any) => {
      const [speise, ...beilagen] = meal.title.de
        .split('|')
        .map((part: string) => part.split('(')[0].trim());
      beilagen.sort((a: string, b: string) => a.localeCompare(b));
      const types = meal.type
        .map((t: string) => typeEmojis[t])
        .filter((e: string) => e);
      return [
        `\`${meal.price.student.replace(' ', '')}\` • ${speise}${types.length > 0 ? ' ' + types.join('') : ''}`,
        `${beilagen.length > 0 ? 'mit ' : ''}${beilagen.map((b: string) => '**' + b + '**').join(', ')}`,
      ];
    });
}

export async function menuToday(message: Message<boolean>, location?: string) {
  switch (location?.charAt(0).toLowerCase()) {
    case 'w':
      embed(
        message,
        'Heutiges Menü',
        '## Mensa',
        await getMenu(mensa, ['N']),
        '🌱 vegan | 🥪 vegetarisch | 🐟 mit Fisch | 🐔 mit Geflügel | 🐄 mit Rind | 🐖 mit Schwein',
      );
      embed(
        message,
        'Heutiges Menü',
        '## FoodFakultät',
        await getMenu(foodfak, ['N']),
        '🌱 vegan | 🥪 vegetarisch | 🐟 mit Fisch | 🐔 mit Geflügel | 🐄 mit Rind | 🐖 mit Schwein',
      );
      embed(
        message,
        'Heutiges Menü',
        '## Galerie',
        await getMenu(galerie, ['N']),
        '🌱 vegan | 🥪 vegetarisch | 🐟 mit Fisch | 🐔 mit Geflügel | 🐄 mit Rind | 🐖 mit Schwein',
      );
      break;
    case 'v':
      embed(
        message,
        'Heutiges Menü',
        '## Mensa',
        await getMenu(mensa, ['N', 'V']),
        '🌱 vegan | 🥪 vegetarisch | 🐟 mit Fisch | 🐔 mit Geflügel | 🐄 mit Rind | 🐖 mit Schwein',
      );
      embed(
        message,
        'Heutiges Menü',
        '## FoodFakultät',
        await getMenu(foodfak, ['N', 'V']),
        '🌱 vegan | 🥪 vegetarisch | 🐟 mit Fisch | 🐔 mit Geflügel | 🐄 mit Rind | 🐖 mit Schwein',
      );
      embed(
        message,
        'Heutiges Menü',
        '## Galerie',
        await getMenu(galerie, ['N', 'V']),
        '🌱 vegan | 🥪 vegetarisch | 🐟 mit Fisch | 🐔 mit Geflügel | 🐄 mit Rind | 🐖 mit Schwein',
      );
      break;
    case 'm':
      embed(
        message,
        'Heutiges Menü',
        '## Mensa',
        await getMenu(mensa),
        '🌱 vegan | 🥪 vegetarisch | 🐟 mit Fisch | 🐔 mit Geflügel | 🐄 mit Rind | 🐖 mit Schwein',
      );
      break;
    case 'f':
      embed(
        message,
        'Heutiges Menü',
        '## FoodFakultät',
        await getMenu(foodfak),
        '🌱 vegan | 🥪 vegetarisch | 🐟 mit Fisch | 🐔 mit Geflügel | 🐄 mit Rind | 🐖 mit Schwein',
      );
      break;
    case 'g':
      embed(
        message,
        'Heutiges Menü',
        '## Galerie',
        await getMenu(galerie),
        '🌱 vegan | 🥪 vegetarisch | 🐟 mit Fisch | 🐔 mit Geflügel | 🐄 mit Rind | 🐖 mit Schwein',
      );
      break;
    default:
      embed(
        message,
        'Heutiges Menü',
        '## Mensa',
        await getMenu(mensa),
        '🌱 vegan | 🥪 vegetarisch | 🐟 mit Fisch | 🐔 mit Geflügel | 🐄 mit Rind | 🐖 mit Schwein',
      );
      embed(
        message,
        'Heutiges Menü',
        '## FoodFakultät',
        await getMenu(foodfak),
        '🌱 vegan | 🥪 vegetarisch | 🐟 mit Fisch | 🐔 mit Geflügel | 🐄 mit Rind | 🐖 mit Schwein',
      );
      embed(
        message,
        'Heutiges Menü',
        '## Galerie',
        await getMenu(galerie),
        '🌱 vegan | 🥪 vegetarisch | 🐟 mit Fisch | 🐔 mit Geflügel | 🐄 mit Rind | 🐖 mit Schwein',
      );
      break;
  }
}
