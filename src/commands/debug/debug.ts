import { Command } from '$commands';
import { ApplicationCommandOptionType } from 'discord.js';

function getProp(obj: any, prop?: string): any {
  if (!prop) return obj;
  const parts = prop.split('.');
  let current = obj;

  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }

  return current;
}

export default new Command(
  'zzz-debug',
  'Gibt Rohdaten aus der Datenbank zurück',
  async (interaction) => {
    interaction.reply(
      `\`\`\`json\n${JSON.stringify(
        getProp(
          store.get(
            interaction.options.getString('key', true),
            interaction.options.getString('prefix', false) ?? undefined,
          ),
          interaction.options.getString('property', false) ?? undefined,
        ),
        undefined,
        4,
      )}\n\`\`\``,
    );
  },
  false,
  [
    {
      name: 'key',
      description: 'key',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'prefix',
      description: 'prefix',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
    {
      name: 'property',
      description: 'property',
      type: ApplicationCommandOptionType.String,
      required: false,
    },
  ],
);
