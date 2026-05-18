import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

export async function getCommands() {
  if (!process.argv[1].includes('/src/'))
    return JSON.parse(fs.readFileSync('commands.json', 'utf-8'));

  const localCommands = [];

  const commandsPath = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '../..',
    'commands',
  );
  const categories = fs.readdirSync(commandsPath);

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);

    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const commands = fs.readdirSync(categoryPath);

    for (const command of commands) {
      const commandPath = path.join(categoryPath, command);

      if (!fs.statSync(commandPath).isFile()) continue;

      const commandModule = await import(commandPath);

      localCommands.push(commandModule.default);
    }
  }

  return localCommands;
}
