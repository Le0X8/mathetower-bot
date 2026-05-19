import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
} from 'discord.js';
import { existsSync } from 'node:fs';

const eras = [
  "[<:debut:1506311826495770624> Taylor Swift](https://tserasarchive.taylorswift.com/selftitled)\n\n_Our song is a slammin' screen door_",
  '[<:fearless:1506313164176752833> Fearless](https://tserasarchive.taylorswift.com/fearless)\n\n_You belong with me_',
  '[<:speaknow:1506313176323592303> Speak Now](https://tserasarchive.taylorswift.com/speaknow)\n\n_Long live all the magic we made_',
  '[<:red:1506313170736648232> Red](https://tserasarchive.taylorswift.com/red)\n\n_Loving him was red_',
  "[<:1989:1506313159265226823> 1989](https://tserasarchive.taylorswift.com/1989)\n\n_Cause, darling, I'm a nightmare dressed like a daydream_",
  '[<:reputation:15063131733119508989> reputation](https://tserasarchive.taylorswift.com/reputation)\n\n_...Ready for it?_',
  "[<:lover:1506313168786559088> Lover](https://tserasarchive.taylorswift.com/lover)\n\n_We could leave the Christmas lights up 'til January_",
  '[<:folklore:1506313166626361475> folklore](https://tserasarchive.taylorswift.com/folklore)\n\n_You drew stars around my scars_',
  '[<:evermore:1506313161978937384> evermore](https://tserasarchive.taylorswift.com/evermore)\n\n_Long story short, I survived_',
  '[<:midnights:1506311848151224574> Midnights](https://tserasarchive.taylorswift.com/midnights)\n\n_So, make the friendship bracelets, take the moment and taste it_',
  "[<:torturedpoetsdept:1506313179687292928> The Tortured Poets Department](https://tserasarchive.taylorswift.com/ttpd)\n\n_You know you're good when you can even do it with a broken heart_",
  '[<:thelifeofashowgirl:1506313178093715547> The Life of a Showgirl](https://tserasarchive.taylorswift.com/thelifeofashowgirl)\n\n_Keep it one hundred on the land, the sea, the sky_',
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
