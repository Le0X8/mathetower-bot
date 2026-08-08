import { Command } from '$commands';
import config from '$config' with { type: 'json' };
import { ApplicationCommandOptionType, Role } from 'discord.js';

export default new Command(
  'zzz-owner-setrole',
  '[Owner-exclusive] Setzt eine Rolle für einen Nutzer',
  async (interaction) => {
    if (interaction.user.id !== config.owner_uid) {
      await interaction.reply({
        content: 'You are not permitted to use this command.',
        ephemeral: true,
      });
      return;
    }

    const role = interaction.options.getRole('role', true) as Role;
    const user = interaction.options.getUser('user', false) ?? interaction.user;
    const remove = interaction.options.getBoolean('remove', false) ?? false;

    const member = await interaction.guild?.members.fetch(user.id);
    if (!member) {
      await interaction.reply({
        content: 'User not found in this server.',
        ephemeral: true,
      });
      return;
    }

    if (remove) {
      await member.roles.remove(role);
      await interaction.reply({
        content: `Removed role ${role.name} from ${user.username}.`,
        ephemeral: true,
      });
      return;
    }

    await member.roles.add(role);
    await interaction.reply({
      content: `Added role ${role.name} to ${user.username}.`,
      ephemeral: true,
    });
  },
  false,
  [
    {
      name: 'role',
      description: 'role',
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
    {
      name: 'user',
      description: 'user',
      type: ApplicationCommandOptionType.User,
      required: false,
    },
    {
      name: 'remove',
      description: 'remove',
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
  ],
);
