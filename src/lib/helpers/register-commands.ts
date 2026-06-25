import config from '$config' with { type: 'json' };
const guildId = config.gid;

import { Client, ApplicationCommandDataResolvable } from 'discord.js';

import { getCommands } from './get-commands.ts';

function areCommandsDifferent(existingCommand: any, localCommand: any) {
  const areChoicesDifferent = (existingChoices: any[], localChoices: any[]) => {
    for (const localChoice of localChoices) {
      const existingChoice = existingChoices?.find(
        (choice) => choice.name === localChoice.name,
      );

      if (!existingChoice) {
        return true;
      }

      if (localChoice.value !== existingChoice.value) {
        return true;
      }
    }

    return false;
  };

  const areOptionsDifferent = (existingOptions: any[], localOptions: any[]) => {
    for (const localOption of localOptions) {
      const existingOption = existingOptions?.find(
        (option) => option.name === localOption.name,
      );

      if (!existingOption) {
        return true;
      }

      if (
        localOption.description !== existingOption.description ||
        localOption.type !== existingOption.type ||
        (localOption.required || false) !== existingOption.required ||
        (localOption.choices?.length || 0) !==
          (existingOption.choices?.length || 0) ||
        areChoicesDifferent(
          localOption.choices || [],
          existingOption.choices || [],
        )
      ) {
        return true;
      }
    }

    return false;
  };

  if (
    existingCommand.description !== localCommand.description ||
    existingCommand.options?.length !== (localCommand.options?.length || 0) ||
    areOptionsDifferent(existingCommand.options, localCommand.options || [])
  ) {
    return true;
  }

  return false;
}

export async function registerCommands(client: Client) {
  try {
    const localCommands = await getCommands();

    const guilds = await client.guilds.fetch();

    for (const [_, oauthguild] of guilds) {
      const guild = await oauthguild.fetch();

      const applicationCommands = await guild.commands.fetch();

      for (const localCommand of localCommands) {
        const { name, description, options, deleted } = localCommand;

        const existingCommand = applicationCommands.find(
          (cmd) => cmd.name === name,
        );

        if (existingCommand) {
          if (deleted) {
            await guild.commands.delete(existingCommand.id);

            console.log(`Deleted command "${name}".`);

            continue;
          }

          if (areCommandsDifferent(existingCommand, localCommand)) {
            await guild.commands.edit(existingCommand.id, {
              description,
              options,
            });

            console.log(`Edited command "${name}".`);
          }
        } else {
          if (deleted) {
            console.log(`Skipped registering command "${name}".`);

            continue;
          }

          await guild.commands.create({
            name,
            description,
            options,
          } as ApplicationCommandDataResolvable);

          console.log(`Registered command "${name}".`);
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
}
