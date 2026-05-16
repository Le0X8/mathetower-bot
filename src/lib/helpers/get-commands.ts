import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

export async function getCommands() {
  const localCommands = [];

  const commandsPath = path.join(path.dirname(fileURLToPath(import.meta.url)), '../..', 'commands');
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
