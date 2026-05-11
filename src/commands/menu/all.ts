import { embed } from '@/helpers/message.ts';
import { cache } from '@/store.ts';
import { Message } from 'discord.js';

const mensa = 341;
const foodfak = 474;
const galerie = 451;

const typeEmojis: Record<string, string> = {
  F: '\\🐟', // mit Fisch
  N: '\\🌱', // vegan
  G: '\\🐔', // mit Geflügel
  R: '\\🐄', // mit Rind
  S: '\\🐖', // mit Schwein
  V: '\\🥪', // vegetarisch
};

const typesVegan = '🌱 vegan';
const typesVegetarian = typesVegan + ' | 🥪 vegetarisch';
const typesAll =
  typesVegetarian +
  ' | 🐟 mit Fisch | 🐔 mit Geflügel | 🐄 mit Rind | 🐖 mit Schwein';

async function getMenu(
  data: Record<string, any>,
  id: number,
  filter: string[] = [],
) {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  const mensaMenu = (await cache(
    data,
    'menu+' + id,
    todayString,
    async () =>
      (
        await (
          await fetch(
            'https://mobil.itmc.tu-dortmund.de/canteen-menu/v3/canteens/' + id,
          )
        ).json()
      )[todayString],
  )) as any;

  return mensaMenu
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
        `> -# ${beilagen.length > 0 ? 'mit ' : 'ohne Beilagen'}${beilagen.map((b: string) => '**' + b + '**').join(', ')}`,
      ];
    });
}

export async function menuToday(
  data: Record<string, any>,
  message: Message<boolean>,
  location?: string,
) {
  const day =
    ' • ' + new Date().toLocaleDateString('de-DE', { dateStyle: 'long' });
  const todayStr = 'Heutiges Menü';
  const todayVeganStr = todayStr + ' (vegan)' + day;
  const todayVegetarianStr = todayStr + ' (vegetarisch)' + day;
  const todayAllStr = todayStr + day;
  switch (location?.charAt(0).toLowerCase()) {
    case 'w':
      embed(
        message,
        todayVeganStr,
        '## Mensa',
        await getMenu(data, mensa, ['N']),
        typesVegan,
      );
      embed(
        message,
        todayVeganStr,
        '## FoodFakultät',
        await getMenu(data, foodfak, ['N']),
        typesVegan,
      );
      embed(
        message,
        todayVeganStr,
        '## Galerie',
        await getMenu(data, galerie, ['N']),
        typesVegan,
      );
      break;
    case 'v':
      embed(
        message,
        todayVegetarianStr,
        '## Mensa',
        await getMenu(data, mensa, ['N', 'V']),
        typesVegetarian,
      );
      embed(
        message,
        todayVegetarianStr,
        '## FoodFakultät',
        await getMenu(data, foodfak, ['N', 'V']),
        typesVegetarian,
      );
      embed(
        message,
        todayVegetarianStr,
        '## Galerie',
        await getMenu(data, galerie, ['N', 'V']),
        typesVegetarian,
      );
      break;
    case 'm':
      embed(
        message,
        todayAllStr,
        '## Mensa',
        await getMenu(data, mensa),
        typesAll,
      );
      break;
    case 'f':
      embed(
        message,
        todayAllStr,
        '## FoodFakultät',
        await getMenu(data, foodfak),
        typesAll,
      );
      break;
    case 'g':
      embed(
        message,
        todayAllStr,
        '## Galerie',
        await getMenu(data, galerie),
        typesAll,
      );
      break;
    default:
      embed(
        message,
        todayAllStr,
        '## Mensa',
        await getMenu(data, mensa),
        typesAll,
      );
      embed(
        message,
        todayAllStr,
        '## FoodFakultät',
        await getMenu(data, foodfak),
        typesAll,
      );
      embed(
        message,
        todayAllStr,
        '## Galerie',
        await getMenu(data, galerie),
        typesAll,
      );
      break;
  }
}
