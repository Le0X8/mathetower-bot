import config from '$config' with { type: 'json' };
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
import { appendFileSync, existsSync, truncateSync } from 'node:fs';
import { spawn } from 'node:child_process';

let gpt6Path = './gpt6/target/release/gpt6';
if (!existsSync(gpt6Path)) {
  gpt6Path += '.exe';
  if (!existsSync(gpt6Path)) {
    throw new Error(
      'gpt6 binary not found, compile it first with `cargo build --release` in the gpt6 directory.',
    );
  }
}

async function gpt6Training() {
  await globalThis.gpt6('\0');
  truncateSync('./dataset.txt', 0);
}

const gpt6Process = spawn(gpt6Path, ['prompt'], {
  stdio: ['pipe', 'pipe', 'pipe'],
});

gpt6Process.stderr.on('data', (data: Buffer) => {
  console.error(data.toString());
});

gpt6Process.on('spawn', () => gpt6Training());

gpt6Process.on('close', (code) => {
  console.log(`gpt6 process exited with code ${code}`);
  process.exit(code ?? 1);
});

let isProcessing = false;
interface QueueItem {
  input: string;
  resolve: (value: string) => void;
  reject: (reason: Error) => void;
}
let queue: QueueItem[] = [];

function gpt6Next() {
  if (queue.length === 0) {
    isProcessing = false;
    return;
  }

  isProcessing = true;
  const { input, resolve } = queue.shift()!;

  let output = '';

  const onData = (data: Buffer) => {
    output += data.toString();

    if (output.includes('\n')) {
      gpt6Process.stdout.off('data', onData);
      resolve(output.trimEnd());
      gpt6Next();
    }
  };

  gpt6Process.stdout.on('data', onData);
  gpt6Process.stdin.write(input + '\n');
}

globalThis.gpt6 = (input: string): Promise<string> =>
  new Promise((resolve, reject) => {
    if (!gpt6Process) {
      reject(new Error('GPT6 is not running'));
      return;
    }

    queue.push({ input, resolve, reject });

    if (!isProcessing) {
      gpt6Next();
    }
  });

setInterval(() => gpt6Training(), 60 * 60 * 1000);

const token = config.token;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

function refreshMembers() {
  client.guilds.fetch().then((guilds) => {
    guilds.forEach((guild) =>
      guild.fetch().then((guild) => guild.members.fetch().catch(console.error)),
    );
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
      if (interaction.guildId !== config.gid) {
        throw new Error('This command can only be used in the main server.');
      }
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
  try {
    if (message.author.bot) return;

    specialMessages(message).catch(console.error);
  } catch {}
});

async function specialMessages(message: Message<boolean>) {
  const content = message.content.toLowerCase();

  if (content.length > 3 && !content.includes('://')) {
    appendFileSync('./dataset.txt', content + '\n');
  }

  if (
    !content.includes('!novx') &&
    (!store.get(message.author.id, 'novx') || content.includes('!vx')) &&
    (content.includes('//x.com') ||
      content.includes('//twitter.com') ||
      content.includes('//www.instagram.com') ||
      content.includes('//vm.seetiktok.com') ||
      content.includes('//vm.tiktok.com') ||
      content.includes('//www.reddit.com') ||
      content.includes('//youtu.be') ||
      content.includes('//youtube.com'))
  ) {
    await message.reply(
      `-# <@${message.author.id}>\n${
        message.content
          .replace('//x.com', '//fixvx.com')
          .replace('//twitter.com', '//fixvx.com')
          .replace('//www.instagram.com', '//www.vxinstagram.com')
          .replace('//vm.seetiktok.com', '//kktiktok.com')
          .replace('//vm.tiktok.com', '//kktiktok.com')
          .replace('//www.reddit.com', '//vxreddit.com')
          // tracking parameters
          .replace(/(\?|&)igsh=/g, '#') // Instagram
          .replace(/(\?|&)s=/g, '#') // Twitter
          .replace(/(\?|&)fbclid=/g, '#') // Facebook
          .replace(/(\?|&)si=/g, '#') // YouTube
          .replace(/(\?|&)utm_/g, '#') // General UTM
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
    await message.react(emojis.icon.yes).catch(() => {});
    await message.react(emojis.icon.no).catch(() => {});
    return;
  }

  if (content.includes('kys') && message.reference) {
    const ref = await message.fetchReference();
    await ref.react('🇰');
    await ref.react('🇾');
    await ref.react('🇸');
    return;
  }

  for (const [trigger, ...reaction] of reactions) {
    if (
      trigger instanceof Array
        ? trigger.some((trg) => content.includes(trg))
        : content.includes(trigger)
    ) {
      for (const r of reaction) {
        await message.react(r);
      }
      break;
    }
  }

  if (Math.floor(Math.random() * 50) === 0) {
    const reactions = Object.values(emojis.reaction);
    await message
      .react(reactions[Math.floor(Math.random() * reactions.length)])
      .catch(() => {});
  }
}
