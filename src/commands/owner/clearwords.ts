import { Command } from '$commands';
import config from '$config' with { type: 'json' };
import { writeFileSync } from 'node:fs';

export default new Command(
  'zzz-owner-clearwords',
  '[Owner-exclusive] Löscht alle Wörter aus der Wordlist',
  async (interaction) => {
    if (interaction.user.id !== config.owner) {
      await interaction.reply({
        content: 'You are not permitted to use this command.',
        ephemeral: true,
      });
      return;
    }

    globalThis.wordlist = {};
    writeFileSync('./words.json', JSON.stringify(globalThis.wordlist), 'utf8');
    await interaction.reply({
      content: `Alle Wörter wurden aus der Wordlist entfernt.`,
    });
  },
  false,
);
