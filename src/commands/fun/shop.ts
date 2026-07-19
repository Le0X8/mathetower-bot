import { Command } from '$commands';
import { emojis } from '$emojis';
import { amount } from '@/lib/helpers/bananen.ts';
import { Bananen } from '@/api/bananen.ts';

const lootboxPrice = 1e12;

export default new Command(
  'lootbox',
  'Gewinne Skins für deine Bananen!',
  async (interaction) => {
    const balance = new Bananen(interaction.user.id);

    if (balance.getValue() < lootboxPrice) {
      await interaction.reply({
        content: `Du hast nicht genug Bananen, um eine Lootbox zu kaufen! Du benötigst \`${amount(lootboxPrice)}\` Bananen.`,
        ephemeral: true,
      });
      return;
    }

    const skins = store.get(interaction.user.id, 'skins') ?? {};
    balance.remove(lootboxPrice);

    const available = Object.keys(emojis.banane.skins).filter(
      (s) => !s.startsWith('_'),
    );

    const skin = available[Math.floor(Math.random() * available.length)];

    if (skins[skin]) skins[skin]++;
    else skins[skin] = 1;

    store.set(interaction.user.id, skins, 'skins');

    await interaction.reply({
      content: `Du hast eine Lootbox gekauft und die Bananensorte \`${skin}\` (${
        (emojis.banane.skins as Record<string, string>)[skin]
      }) erhalten! Du hast nun \`${skins[skin]}\` Stück davon.\nBenutze \`/skins use:${skin}\`, um ihn zu nutzen.`,
    });
  },
);
