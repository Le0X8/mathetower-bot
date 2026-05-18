import { writeFileSync } from 'node:fs';
import { getCommands } from './get-commands.ts';

getCommands().then((cmds) =>
  writeFileSync('commands.json', JSON.stringify(cmds)),
);
