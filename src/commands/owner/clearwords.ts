import { Command } from '$commands';
import config from '$config' with { type: 'json' };
import { pack } from 'msgpackr';
import { writeFileSync } from 'node:fs';
import * as zstd from 'zstd-napi';

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

    globalThis.wordlist = {
      graph: {},
      tokens: { '\0': '0' },
      words: { '0': '\0' },
    };
    writeFileSync(
      './words.msgpack',
      zstd.compress(pack(globalThis.wordlist), { compressionLevel: 1 }),
    );
    await interaction.reply({
      content: `Alle Wörter wurden aus der Wordlist entfernt.`,
    });
  },
  false,
);
