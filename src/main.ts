import config from '../config.json' with { type: 'json' };
const token = config.token;

import {
  ActivityType,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  type Message,
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
        interaction.reply({
          content: 'Not enough permissions.',
          ephemeral: true,
        });
      }
    }

    commandObject.callback(interaction);
  } catch (error) {
    console.log(`There was an error running this command: ${error}`);
  }
});

client.on(Events.MessageCreate, (message) => {
  if (message.author.bot) return;
  const isAdmin = message.member?.permissions.has(
    PermissionFlagsBits.Administrator,
  );

  const isShortCmd = message.content.startsWith('%%');
  const isCommand =
    isShortCmd ||
    message.content.includes(`<@${config.uid}>`) ||
    message.content.includes(`<@&${config.rid}>`);
  if (!isCommand) return specialMessages(message);

  const command = message.content
    .replace(`<@${config.uid}>`, '')
    .replace(`<@&${config.rid}>`, '')
    .slice(isShortCmd ? 2 : 0)
    .trim()
    .split(' ');
  switch (command[0].toLowerCase()) {
    case 'echo':
      message.reply(command.slice(1).join(' '));
      break;
    case 'exam.set':
      if (!isAdmin) message.react('<:pointlaugh:1474081749985267714>');
      else {
        const subject = command[1];
        const date1 = parseDate(command[2]);
        const date2 = parseDate(command[3]);
        set(store, 'exam+' + subject.toLowerCase(), [
          date1.toISOString(),
          date2.toISOString(),
        ]);
        message.reply(
          `Klausur für ${subject.toUpperCase()} gesetzt auf ${formatDate(date1)} und ${formatDate(date2)}.`,
        );
      }

      break;
    case 'exam.clear':
      if (!isAdmin) message.react('<:pointlaugh:1474081749985267714>');
      else {
        const subject = command[1];
        clear(store, 'exam+' + subject.toLowerCase());
        message.reply(`Klausur für ${subject.toUpperCase()} gelöscht.`);
      }
      break;

    case 'klausuren':
    case 'exam.list':
      examList().then((embed: EmbedBuilder) => 
        message.reply({ embeds: [embed] })
      )
      break;

    case 'klausur':
    case 'exam.get':
      examGet(command[1]).then((embed: EmbedBuilder) => 
        message.reply({ embeds: [embed] })
      )
      break;

    case '':
    case 'help':
    case 'info':
    case 'hilfe':
    case 'hilf':
      help().then((embed: EmbedBuilder) => 
        message.reply({ embeds: [embed] })
      );
      break;

    case 'essen':
    case 'menü':
    case 'menu.all':
      menuToday(-1).then((embeds: EmbedBuilder[]) => 
        message.reply({ embeds: embeds })
      );
      break;

    case 'vegetarisch':
    case 'menu.vegetarian':
      menuToday(-1, 2).then((embeds: EmbedBuilder[]) => 
        message.reply({ embeds: embeds })
      );
      break;

    case 'vegan':
    case 'menu.vegan':
      menuToday(-1, 1).then((embeds: EmbedBuilder[]) => 
        message.reply({ embeds: embeds })
      );
      break;

    case 'foodfakultät':
    case 'foodfak':
    case 'menu.foodfak':
      menuToday(MENSA_IDS.FOODFAK).then((embeds: EmbedBuilder[]) => 
        message.reply({ embeds: embeds })
      );
      break;

    case 'mensa':
    case 'menu.mensa':
      menuToday(MENSA_IDS.MENSA).then((embeds: EmbedBuilder[]) => 
        message.reply({ embeds: embeds })
      );
      break;

    case 'galerie':
    case 'menu.galerie':
      menuToday(MENSA_IDS.GALERIE).then((embeds: EmbedBuilder[]) => 
        message.reply({ embeds: embeds })
      );
      break;

    case 'waow':
      message.react('💔');
      message.reply({
        files: [
          {
            attachment: './media/waow-based.png',
            name: 'waow.png',
          },
        ],
      });
      break;

    default:
      message.react('<:pointlaugh:1474081749985267714>');
      break;
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
