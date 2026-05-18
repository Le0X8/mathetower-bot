import { MENSA_IDS } from '@/config/mensa.ts';
import { buildEmbed } from '@/lib/embeds/default-embed.ts';
import { cache, load } from '@/store.ts';
import { EmbedBuilder } from 'discord.js';
import { buildErrorEmbed } from './error-embed.ts';

const typeEmojis: Record<string, string> = {
  F: '🐟', // mit Fisch
  N: '🌱', // vegan
  G: '🐔', // mit Geflügel
  R: '🐄', // mit Rind
  S: '🐖', // mit Schwein
  V: '🥪', // vegetarisch
};

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

function getTitle(location: number) {
  switch (location) {
    case MENSA_IDS.MENSA:
      return 'Mensa';
    case MENSA_IDS.FOODFAK:
      return 'FoodFakultät';
    case MENSA_IDS.GALERIE:
      return 'Galerie';
    default:
      return '';
  }
}

export async function menuToday(location: number, filter?: number) {
  const data = load();

  const locations = location === -1 ? Object.values(MENSA_IDS) : [location];
  const filterArr = filter === 1 ? ['N'] : filter === 2 ? ['V', 'N'] : [];
  const todayStr =
    'Heutiges Menü' +
    (filter === 1 ? ' (vegan)' : filter === 2 ? ' (vegetarisch)' : '') +
    ' • ' +
    new Date().toLocaleDateString('de-DE', { dateStyle: 'long' });
  const typesStr =
    '🌱 vegan' +
    (filter !== 1 ? ' | 🥪 vegetarisch' : '') +
    (!filter
      ? ' | 🐟 mit Fisch | 🐔 mit Geflügel | 🐄 mit Rind | 🐖 mit Schwein'
      : '');

  const embeds: EmbedBuilder[] = [];
  for (const id of locations) {
    try {
      embeds.push(
        await buildEmbed(
          todayStr,
          '## ' + getTitle(id),
          await getMenu(data, id, filterArr),
          typesStr,
        ),
      );
    } catch (error) {
      embeds.push(
        await buildErrorEmbed(
          `Keine Daten für die Mensa **${getTitle(id)}** verfügbar.`,
        ),
      );
    }
  }

  return embeds;
}
