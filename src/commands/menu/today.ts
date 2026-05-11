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
    .map((meal: any) => {
      const [speise, ...beilagen] = meal.title.de
        .split('|')
        .map((part: string) => part.split('(')[0].trim());
      const types = meal.type
        .map((t: string) => typeEmojis[t])
        .filter((e: string) => e);
      return `- **${speise}** \`${meal.price.student}\`${types.length > 0 ? ' ' + types.join('') : ''}${beilagen.length > 0 ? ' mit\n  - ' : ''}${beilagen.join('\n  - ')}`;
    })
    .join('\n');
}

export async function menuToday(location?: string) {
  switch (location?.charAt(0).toLowerCase()) {
    case 'w':
      return (
        '# Heutiges Menü 🌱 (vegan)\n## Mensa\n' +
        (await getMenu(mensa, ['N'])) +
        '\n## FoodFakultät\n' +
        (await getMenu(foodfak, ['N'])) +
        '\n## Galerie\n' +
        (await getMenu(galerie, ['N'])) +
        '\n-# 🌱 vegan'
      );
    case 'v':
      return (
        '# Heutiges Menü 🥪 (vegetarisch)\n## Mensa\n' +
        (await getMenu(mensa, ['N', 'V'])) +
        '\n## FoodFakultät\n' +
        (await getMenu(foodfak, ['N', 'V'])) +
        '\n## Galerie\n' +
        (await getMenu(galerie, ['N', 'V'])) +
        '\n-# 🌱 vegan | 🥪 vegetarisch'
      );
    case 'm':
      return (
        '# Heutiges Menü\n## Mensa\n' +
        (await getMenu(mensa)) +
        '\n-# 🌱 vegan | 🥪 vegetarisch | 🐟 mit Fisch | 🐔 mit Geflügel | 🐄 mit Rind | 🐖 mit Schwein'
      );
    case 'f':
      return (
        '# Heutiges Menü\n## FoodFakultät\n' +
        (await getMenu(mensa)) +
        '\n-# 🌱 vegan | 🥪 vegetarisch | 🐟 mit Fisch | 🐔 mit Geflügel | 🐄 mit Rind | 🐖 mit Schwein'
      );
    case 'g':
      return (
        '# Heutiges Menü\n## Galerie\n' +
        (await getMenu(mensa)) +
        '\n-# 🌱 vegan | 🥪 vegetarisch | 🐟 mit Fisch | 🐔 mit Geflügel | 🐄 mit Rind | 🐖 mit Schwein'
      );
    default:
      return [
        '# Heutiges Menü\n## Mensa\n' +
          (await getMenu(mensa)) +
          '\n-# 🌱 vegan | 🥪 vegetarisch | 🐟 mit Fisch | 🐔 mit Geflügel | 🐄 mit Rind | 🐖 mit Schwein',
        '\n## FoodFakultät\n' +
          (await getMenu(foodfak)) +
          '\n-# 🌱 vegan | 🥪 vegetarisch | 🐟 mit Fisch | 🐔 mit Geflügel | 🐄 mit Rind | 🐖 mit Schwein',
        '\n## Galerie\n' +
          (await getMenu(galerie)) +
          '\n-# 🌱 vegan | 🥪 vegetarisch | 🐟 mit Fisch | 🐔 mit Geflügel | 🐄 mit Rind | 🐖 mit Schwein',
      ];
  }
}
