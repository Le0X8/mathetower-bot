import { buildEmbed } from '@/lib/embeds/default-embed.ts';

const helptext = `## Befehle
Du kannst Befehle direkt über Discord Slash Commands verwenden ("/").
### Allgemein
- \`/help\`: Zeigt diese Nachricht an
### Mensaplan
- \`/mensa\`: Zeigt den Mensaplan
  - Standard: Hauptmensa wird angezeigt, wenn keine Auswahl getroffen wird
  - Optional:
    - \`mensa\`: Mensa auswählen (Mensa, FoodFakultät, Galerie, Alle)
    - \`filter\`: Vegan oder Vegetarisch
### Klausuren
- \`/klausuren\`: Zeigt alle Klausurtermine
- \`/klausuren subject:<modul>\`: Zeigt Klausurtermine für ein bestimmtes Modul
`;

export async function help() {
  return await buildEmbed(
    'Hilfe',
    helptext,
    [],
    'Dieser Bot ist open source. Wenn du Ideen/Verbesserungen hast, kannst du gerne auf GitHub beitragen: github.com/Le0X8/mathetower-bot',
  );
}
