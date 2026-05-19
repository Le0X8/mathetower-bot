import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
} from 'discord.js';
import { existsSync } from 'node:fs';

const eras = [
  "<:debut:241062089555181568> [Taylor Swift](https://tserasarchive.taylorswift.com/selftitled)\n\n_Our song is a slammin' screen door_",
  '<:fearless:241062021695537153> [Fearless](https://tserasarchive.taylorswift.com/fearless)\n\n_You belong with me_',
  '<:speaknow:241061975553998849> [Speak Now](https://tserasarchive.taylorswift.com/speaknow)\n\n_Long live all the magic we made_',
  '<:red:241061922986786817> [Red](https://tserasarchive.taylorswift.com/red)\n\n_Loving him was red_',
  "<:1989:241061862756581378> [1989](https://tserasarchive.taylorswift.com/1989)\n\n_Cause, darling, I'm a nightmare dressed like a daydream_",
  '<:reputation:350017146652459019> [reputation](https://tserasarchive.taylorswift.com/reputation)\n\n_...Ready for it?_',
  "<:lover:588826600402059290> [Lover](https://tserasarchive.taylorswift.com/lover)\n\n_We could leave the Christmas lights up 'til January_",
  '<:folklore:735835771570749450> [folklore](https://tserasarchive.taylorswift.com/folklore)\n\n_You drew stars around my scars_',
  '<:evermore:786589893483692032> [evermore](https://tserasarchive.taylorswift.com/evermore)\n\n_Long story short, I survived_',
  '<:midnights:1013663160970002512> [Midnights](https://tserasarchive.taylorswift.com/midnights)\n\n_So, make the friendship bracelets, take the moment and taste it_',
  "<:torturedpoetsdept:1203932365706235955> [The Tortured Poets Department](https://tserasarchive.taylorswift.com/ttpd)\n\n_You know you're good when you can even do it with a broken heart_",
  '<:thelifeofashowgirl:1405325530315755663> [The Life of a Showgirl](https://tserasarchive.taylorswift.com/thelifeofashowgirl)\n\n_Keep it one hundred on the land, the sea, the sky_',
];

export default {
  name: 'era',
  description: 'zeigt dir deine akutelle era an',
  options: [
    {
      name: 'user',
      description: 'Wessen era möchtest du sehen?',
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ],

  async callback(interaction: ChatInputCommandInteraction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const today = new Date();
    const year = today.getFullYear();
    const quarter = Math.floor(today.getMonth() / 3);
    const era =
      eras[
        await store.cache('era+' + user.id, `${year}:${quarter}`, async () => {
          return Math.floor(Math.random() * eras.length);
        })
      ];
    const id = era.split(':')[1].toString();
    await interaction.reply({
      content: `<@${user.id}> ist gerade in seiner **${era.split('\n\n')[0]}** era!\n\n${era.split('\n\n')[1]}`,
      files: existsSync(`./media/eras/${id}.jpg`)
        ? [
            {
              attachment: `./media/eras/${id}.jpg`,
              name: id + '.jpg',
            },
          ]
        : [],
    });
  },
};
