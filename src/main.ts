import config from '../config.json' with { type: 'json' };
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
import { load, set, clear } from '@/store.ts';
import { getCommands } from '@/lib/helpers/get-commands.ts';
import { registerCommands } from '@/lib/helpers/register-commands.ts';
import { formatDate, parseDate } from './lib/helpers/date.ts';
import { examGet, examList } from './lib/embeds/exam.ts';
import { menuToday } from './lib/embeds/menu.ts';
import { MENSA_IDS } from './config/mensa.ts';
import { help } from './lib/embeds/help.ts';
import { buildErrorEmbed } from './lib/embeds/error-embed.ts';
const store = load();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

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
});

client.on(Events.InteractionCreate, async (interaction) => {
if (!interaction.isChatInputCommand()) return;

  const localCommands = await getCommands();

  try {
    const commandObject = localCommands.find(
      (cmd) => cmd.name === interaction.commandName
    );

    if (!commandObject) return;

    if (commandObject.isAdminCommand) {
      if (!interaction.memberPermissions?.has( PermissionFlagsBits.Administrator )) {
        interaction.reply({ embeds: [await buildErrorEmbed('Not enough permissions.')], flags: MessageFlags.Ephemeral });
        return;
      }
    }

    commandObject.callback(interaction);
  } catch (error) {
    console.log(`There was an error running this command: ${error}`);
  }
});

client.login(token);

async function specialMessages(message: Message<boolean>) {
  const content = message.content.toLowerCase();

  if (
    content.includes('//x.com') ||
    content.includes('//twitter.com') ||
    content.includes('//www.instagram.com')
  ) {
    await message.reply(
      `-# SUPER MAGA PALANTIR ICE PETER THIEL AI DATA HARVESTER 9000 entfernt\n\n<@${message.author.id}>\n\n${message.content //i may be blind but where is the tracker being removed
        .replace('//x.com', '//vxtwitter.com')
        .replace('//twitter.com', '//vxtwitter.com')
        .replace('//www.instagram.com', '//www.vxinstagram.com')}`,
    );
    message.delete();
    return;
  }

  if (content.includes('kys') && message.reference) {
    const ref = await message.fetchReference();
    await ref.react('🇰');
    await ref.react('🇾');
    await ref.react('🇸');
    return;
  }

  reactions.forEach(async ([trigger, ...reaction]) => {
    if (content.includes(trigger)) {
      for (const r of reaction) {
        await message.react(r);
      }
    }
  });
}
