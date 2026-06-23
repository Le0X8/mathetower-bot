import { Command } from '$commands';
import config from '$config' with { type: 'json' };
import { ApplicationCommandOptionType } from 'discord.js';

export default new Command(
  'zzz-owner-replacewords',
  '[Owner-exclusive] Tauscht im /random-Command einen Substring gegen was anderes aus',
  async (interaction) => {
    if (interaction.user.id !== config.owner) {
      await interaction.reply({
        content: 'You are not permitted to use this command.',
        ephemeral: true,
      });
      return;
    }

    const word = interaction.options.getString('word', true);
    const replacement = interaction.options.getString('replacement', true);

    const replacements = store.get('replacements2') ?? {};
    if (replacements[word]) {
      delete replacements[word];
      await interaction.reply({
        content: `Das Wort \`${word}\` wurde aus den Ersetzungen entfernt.`,
      });
    } else {
      replacements[word] = replacement;
      store.set('replacements2', null, replacements);
      await interaction.reply({
        content: `Der Substring \`${word}\` wird nun durch \`${replacement}\` ersetzt.`,
      });
    }
  },
  false,
  [
    {
      name: 'word',
      description: 'word',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'replacement',
      description: 'replacement',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
);
