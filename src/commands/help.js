import config from '../../config.json' with { type: 'json' };

const helptext = `# Mathetower-Bot

## Befehle

Du kannst Befehle verwenden, indem du eine Nachricht mit \`%%\` beginnst oder <@&${config.rid}> erwähnst.

### Allgemein

- \`help\`, \`info\`, \`hilfe\`, \`hilf\`: Zeigt diese Nachricht an
- \`echo <text>\`: Wiederholt den Text

### Klausuren

- \`exam.get <modul>\`, \`klausur <modul>\`: Klausurtermine für ein Modul
- \`exam.list\`, \`klausuren\`: Alle Klausurtermine
- \`exam.set <modul> <datum1> <datum2>\`: _(ADMIN)_ Klausurtermin setzen
- \`exam.clear <modul>\`: _(ADMIN)_ Klausurtermin löschen
`;

export function help() {
  return helptext;
}
