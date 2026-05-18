import { Command } from '$commands';
import { Buffer } from 'node:buffer';
import { ApplicationCommandOptionType, GuildMember } from 'discord.js';
import { createCanvas } from '@napi-rs/canvas';

export default new Command(
  'kill',
  'tötet jemanden',
  async (interaction) => {
    const source =
      (interaction.member as GuildMember).nickname ??
      interaction.user.globalName ??
      interaction.user.username;

    await interaction.reply({
      files: [
        {
          contentType: 'image/png',
          attachment: Buffer.from(''),
          name: 'kill.png',
        },
      ],
    });
  },
  false,
  [
    {
      name: 'target',
      description: 'die Person die du töten willst',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
  ],
);
