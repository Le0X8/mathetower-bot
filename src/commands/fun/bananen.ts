import { Command } from '$commands';
import { buildEmbed } from '@/lib/embeds/default-embed.ts';
import { amount, nb } from '@/lib/helpers/bananen.ts';
import { ApplicationCommandOptionType } from 'discord.js';
import config from '$config' with { type: 'json' };
import {
  Bananen,
  bananeStrings,
  BananeType,
  bananeValues,
} from '@/util/bananen.ts';

export const prestigeCost = (prestige: number) => 1e9 * (prestige + 1) ** 2;

export default new Command(
  'bananen',
  'Zeigt dir deine Bananen an',
  async (interaction) => {
    const action = interaction.options.getString('action', false);

    const user = interaction.options.getUser('user', false) || interaction.user;
    const id = user.id;
    const b = new Bananen(id).normalize();

    const value = b.getValue();
    switch (action) {
      case 'prestige':
        const cost = prestigeCost(store.get(user.id, 'prestige') ?? 0);
        if (value < cost) {
          await interaction.reply({
            content: `Du brauchst ${nb(
              cost,
            )} Bananen, um das nächste Prestige-Level zu erreichen!`,
            ephemeral: true,
          });
          return;
        }
        if (user.id !== interaction.user.id) {
          new Bananen(interaction.user.id).transfer(b, value);
          await interaction.reply({
            content: `# <@${user.id}>\nDu hast \`${nb(value)}\` Bananen von <@${interaction.user.id}> geschenkt bekommen, damit du prestigen kannst!`,
          });
          return;
        }
        new Bananen(interaction.user.id).reset();
        store.set(interaction.user.id, 'plantage', { land: 0, multiplier: 1 });
        const donators: Record<string, number> = store.get('donators') ?? {};
        delete donators[interaction.user.id];
        store.set('donators', null, donators);
        const prestige = (store.get(interaction.user.id, 'prestige') ?? 0) + 1;
        await interaction.reply({
          content: `<@${interaction.user.id}> ist jetzt Prestige Level ${
            prestige
          }!\n\nAlle Bananen, Plantagen und Investitionen wurden gecleart, dafür hast du jetzt einen permanenten Bonus von ${prestige * 200}% auf alle Erträge deiner Plantage!\nDu kannst dir das nächste Prestige-Level holen, wenn du ${nb(prestigeCost(prestige))} Bananen verdient hast!`,
        });
        store.set(interaction.user.id, 'prestige', prestige);
        return;

      default:
        break;
    }

    if (id == config.uid) {
      const donators: Record<string, number> = store.get('donators') ?? {};
      const total = Object.values(donators).reduce((a, b) => a + b, 0);
      const top = Object.entries(donators).sort(([, a], [, b]) => b - a);
      const plantage: { land: number; multiplier: number } = store.get(
        id,
        'plantage',
      ) ?? { land: 0, multiplier: 1 };

      await interaction.reply({
        embeds: [
          await buildEmbed(
            'Investoren',
            'Insgesamt investiert: ' + nb(total),
            top.map(([key, count], i) => {
              const user = interaction.client.users.cache.get(key);
              const share =
                total > 0 ? ((count / total) * 50).toFixed(2) : '0.00';
              return [
                `**${i + 1}. @${user?.username ?? '#' + key}:** ${share}%`,
                `\`${nb(count)}\` → \`${nb((count / total / 2) * (plantage.land * plantage.multiplier))}\`/min`,
              ];
            }),
            '50% Rest wird für Upgrades verwendet.',
          ),
        ],
      });
      return;
    }

    await interaction.reply({
      embeds: [
        await buildEmbed(
          `Alle Bananen von @${user.username}`,
          value == 0 ? 'Dieser Nutzer hat noch keine Bananen gesammelt.' : null,
          Object.entries(b.bananen)
            .sort(([a], [b]) => parseInt(a) - parseInt(b))
            .map(([key, count]) => {
              const banane = parseInt(key) as BananeType;
              const strings = bananeStrings(banane);
              return [
                `**${strings[1]} ${strings[0]} Bananen**`,
                `\`${amount(count)}\` Banane${count == 1 ? '' : 'n'} @ \`${nb(bananeValues[banane])}\` = \`${nb(count * bananeValues[banane])}\``,
              ];
            }),
          value == 0
            ? null
            : `Summe: Wert von ${amount(value)} normalen Banane${value == 1 ? '' : 'n'} (\u0e3f)`,
        ),
      ],
    });
  },
  false,
  [
    {
      name: 'user',
      description: 'Wessen Bananen möchtest du sehen?',
      type: ApplicationCommandOptionType.User,
      required: false,
    },
    {
      name: 'action',
      description: 'Was möchtest du tun?',
      type: ApplicationCommandOptionType.String,
      required: false,
      choices: [
        {
          name: 'Prestige (CLEART ALLES)',
          value: 'prestige',
        },
      ],
    },
  ],
);
