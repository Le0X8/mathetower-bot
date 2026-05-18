import { Command } from '$commands';
import { ChatInputCommandInteraction, TextChannel } from 'discord.js';

export default new Command('error', 'schlägt fehl', async (_interaction) => {
  throw new Error('banane 🍌');
});

enum Banane {
  Gelb = 0, // 60%
  Grün = 1, // 29%
  Braun = 2, // 10%
  Bewaffnet = 99, // 1%
}

function bananeStrings(banane: Banane): [string, string, string] {
  switch (banane) {
    case Banane.Gelb:
      return [
        'normale gelbe',
        '<:normal:1505971920858779800>',
        'da ist wirklich nix besonderes dran 🫩✌️🥀',
      ];
    case Banane.Grün:
      return [
        'unreife grüne',
        '<:gruen:1505973348876943493>',
        "vielleicht bisschen hart aber wer's mag :(",
      ];
    case Banane.Braun:
      return [
        'vergammelte braune',
        '<:braun:1505973784249761923>',
        'würd ich jetzt nicht mehr essen 🤮',
      ];
    case Banane.Bewaffnet:
      return [
        'schwer bewaffnete 😳',
        '<:bewaffnet:1505976549051207760>',
        '🤚 "Hände hoch" ✋',
      ];
  }
}

const bananeRanges: Record<Banane, number> = {
  [Banane.Gelb]: 60,
  [Banane.Grün]: 89,
  [Banane.Braun]: 99,
  [Banane.Bewaffnet]: 100,
};

function bananeRng(): Banane {
  const rng = Math.ceil(Math.random() * 100);

  for (const range of Object.entries(bananeRanges))
    if (range[1] <= rng) return parseInt(range[0]) as Banane;
  return Banane.Gelb;
}

export async function catchBanane(
  interaction: ChatInputCommandInteraction,
  fromError: boolean = true,
) {
  if (!(interaction.channel instanceof TextChannel)) return;
  const banane = bananeRng();
  const s = bananeStrings(banane);

  const counter =
    (store.get(interaction.user.id, 'banane') as Record<Banane, number>) ?? {};
  if (typeof counter[banane] != 'number') counter[banane] = 0;
  counter[banane]++;

  await interaction.channel.send(
    (fromError ? `-# <@${interaction.user.id}> used \`/error\`\n\n` : '') +
      `danke bro, hier hast du eine **${s[0]} Banane**. ${s[1]}\nDu hast jetzt \`${counter[banane]}\` davon.\n\n_${s[2]}_`,
  );
  store.set(interaction.user.id, 'banane', counter);
}
