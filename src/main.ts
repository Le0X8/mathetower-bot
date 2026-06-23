import config from '$config' with { type: 'json' };
const token = config.token;

import {
  ActivityType,
  Client,
  Events,
  GatewayIntentBits,
  type Message,
  MessageFlags,
  PermissionFlagsBits,
} from 'discord.js';

import { reactions } from '@/reactions.ts';
import '@/store.ts';
import '@/config/plantage.ts';
import { getCommands } from '@/lib/helpers/get-commands.ts';
import { registerCommands } from '@/lib/helpers/register-commands.ts';
import { buildErrorEmbed } from './lib/embeds/error-embed.ts';
import { catchBanane } from '@/commands/debug/error.ts';
import { emojis } from '$emojis';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

function refreshMembers() {
  client.guilds.fetch(config.gid).then((guild) => {
    guild.members.fetch().catch(console.error);
  });
}

client.once(Events.ClientReady, (readyClient) => {
  registerCommands(readyClient);
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  client.user?.setPresence({
    activities: [
      {
        name: 'oh14.de/exit',
        type: ActivityType.Custom,
        url: 'https://oh14.de/exit',
      },
    ],
    status: 'online',
  });

  refreshMembers();
  setInterval(refreshMembers, 60 * 60 * 1000);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const localCommands = await getCommands();

  try {
    const commandObject = localCommands.find(
      (cmd: { name: string }) => cmd.name === interaction.commandName,
    );

    if (!commandObject) return;

    if (commandObject.isAdminCommand) {
      if (
        !interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)
      ) {
        throw new Error('Not enough permissions.');
      }
    }

    await commandObject.callback(interaction);
  } catch (error) {
    console.log(error);
    try {
      await interaction.reply({
        embeds: [await buildErrorEmbed(error as Error)],
        flags: MessageFlags.Ephemeral,
      });
      if ((error as Error).message === 'banane 🍌') {
        return await catchBanane(interaction);
      }
      await client.users.fetch(config.owner).then(async (user) => {
        user
          .send({
            embeds: [
              await buildErrorEmbed(
                error as Error,
                `Error in command: \`${interaction.commandName}\` with args: \`${JSON.stringify(interaction.options.data)}\``,
              ),
            ],
            flags: MessageFlags.SuppressNotifications,
          })
          .catch(console.error);
      });
    } catch (e) {
      console.error(e);
    }
  }
});

client.login(token);

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  if (Math.floor(Math.random() * 50) === 0) {
    const reactions = Object.values(emojis.reaction);
    await message
      .react(reactions[Math.floor(Math.random() * reactions.length)])
      .catch(() => {});
  }

  specialMessages(message).catch(console.error);
});

if (!existsSync('./words.json')) writeFileSync('./words.json', '{}', 'utf8');
const wordList: Record<string, number> = JSON.parse(
  readFileSync('./words.json', 'utf8'),
);

async function specialMessages(message: Message<boolean>) {
  const content = message.content.toLowerCase();

  const words = content
    .split(/[^a-zäöüß]/g)
    .filter((w) => w.length > 2 && w.length < 20 && content.length < 150);
  words.forEach((word) => {
    if (wordList[word]) {
      wordList[word]++;
    } else {
      wordList[word] = 1;
    }
  });
  writeFileSync('./words.json', JSON.stringify(wordList), 'utf8');

  if (
    content.includes('//x.com') ||
    content.includes('//twitter.com') ||
    content.includes('//www.instagram.com') ||
    content.includes('//vm.seetiktok.com') ||
    content.includes('//vm.tiktok.com') ||
    content.includes('//www.reddit.com')
  ) {
    await message.reply(
      `-# SUPER MAGA PALANTIR ICE PETER THIEL AI DATA HARVESTER 9000 entfernt\n\n<@${message.author.id}>\n\n${
        message.content //i may be blind but where is the tracker being removed
          .replace('//x.com', '//vxtwitter.com')
          .replace('//twitter.com', '//vxtwitter.com')
          .replace('//www.instagram.com', '//www.vxinstagram.com')
          .replace('//vm.seetiktok.com', '//kktiktok.com')
          .replace('//vm.tiktok.com', '//kktiktok.com')
          .replace('//www.reddit.com', '//vxreddit.com')
          // tracking parameters
          .replace(/(\?|&)igsh=/g, '#')
          .split('#')[0]
      }`,
    );
    message.delete();
    return;
  }

  if (
    content.endsWith('?') &&
    !content.includes('welche') &&
    !content.includes('was') &&
    !content.startsWith('wer') &&
    !content.includes('wie') &&
    !content.includes('wo') &&
    !content.includes('wann') &&
    !content.includes('warum') &&
    !content.includes('weshalb') &&
    (!content.includes('oder ') || content.includes('oder so'))
  ) {
    await message.react('✅').catch(() => {});
    await message.react('❌').catch(() => {});
  }

  if (content.includes('kys') && message.reference) {
    const ref = await message.fetchReference();
    await ref.react('🇰');
    await ref.react('🇾');
    await ref.react('🇸');
  }

  reactions.forEach(async ([trigger, ...reaction]) => {
    if (
      trigger instanceof Array
        ? trigger.some((trg) => content.includes(trg))
        : content.includes(trigger)
    ) {
      for (const r of reaction) {
        await message.react(r);
      }
    }
  });
}
