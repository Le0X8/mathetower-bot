import { Command } from '$commands';
import { ApplicationCommandOptionType } from 'discord.js';

export default new Command(
  'tokenize',
  'Übersetzt einen Input-String in Tokens',
  async (interaction) => {
    let content = interaction.options.getString('string', true);

    let out: string[] = [];
    const words = content
      .toLowerCase()
      .split(/[^a-zäöüß]/g)
      .filter((w) => w.length > 1 && w.length < 40);
    words.forEach((word) => {
      if (
        /[bcdfghjklmnpqrstvwxyz\.\,\!\?\=]{5}/.test(
          word
            .replaceAll('sch', '.')
            .replaceAll('ch', ',')
            .replaceAll('ck', '!')
            .replaceAll('ph', '?')
            .replaceAll('qu', '='),
        )
      ) {
        return;
      }

      if (wordlist.tokens[word]) {
        word = wordlist.tokens[word];
      } else {
        const id = Object.keys(wordlist.tokens).length.toString(36);
        wordlist.tokens[word] = id;
        wordlist.words[id] = word;
        word = id;
      }

      out.push(word);
    });

    await interaction.reply({
      content: out.join(' ').slice(0, 2000) || '<unresolvable>',
      ephemeral: true,
    });
  },
  false,
  [
    {
      name: 'string',
      description: 'Der String, der in Tokens übersetzt werden soll',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
);
