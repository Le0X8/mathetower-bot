import { embed } from '@/helpers/message.ts';
import config from '../../config.json' with { type: 'json' };
import { type Message } from 'discord.js';

const helptext = `## Befehle
Du kannst Befehle verwenden, indem du eine Nachricht mit \`%%\` beginnst oder <@&${config.rid}> erwähnst.
### Allgemein
- \`help\`, \`info\`, \`hilfe\`, \`hilf\`: Zeigt diese Nachricht an
- \`echo <text>\`: Wiederholt den Text
### Mensaplan
- \`menu.all [filter]\`, \`menü [filter]\`, \`essen [filter]\`: Zeigt alles an, was es heute zu Essen gibt
- \`menu.vegan\`, \`vegan\`: Zeigt nur vegane Gerichte an
- \`menu.vegetarian\`, \`vegetarisch\`: Zeigt nur vegetarische Gerichte an
- \`menu.mensa\`: Zeigt nur Gerichte der Mensa an
- \`menu.foodfak\`, \`foodfakultät\`, \`foodfak\`: Zeigt nur Gerichte der FoodFakultät an
- \`menu.galerie\`: Zeigt nur Gerichte der Galerie an
### Klausuren
- \`exam.get <modul>\`, \`klausur <modul>\`: Klausurtermine für ein Modul
- \`exam.list\`, \`klausuren\`: Alle Klausurtermine
- \`exam.set <modul> <datum1> <datum2>\`: _(ADMIN)_ Klausurtermin setzen
- \`exam.clear <modul>\`: _(ADMIN)_ Klausurtermin löschen
`;

export async function help(message: Message<boolean>) {
  await embed(
    message,
    'Hilfe',
    helptext,
    [],
    'Dieser Bot ist open source. Wenn du Ideen/Verbesserungen hast, kannst du gerne auf GitHub beitragen: github.com/Le0X8/mathetower-bot',
  );
}
