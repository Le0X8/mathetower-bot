import { existsSync, truncateSync } from 'node:fs';
import config from '$config' with { type: 'json' };
import { spawn } from 'node:child_process';

const gpt6TrainInterval = 10 * 60 * 1000;

const originalStderrWrite = process.stderr.write.bind(process.stderr);

globalThis.statusChannel = null;

let stderrCache: string[] = [];
process.stderr.write = (
  buffer: Uint8Array | string,
  encodingOrCb?: BufferEncoding | ((err?: Error) => void),
  cb?: (err?: Error | null) => void,
): boolean => {
  const stderrOut = buffer.toString().trim();
  console.log(stderrOut);
  stderrCache.push(stderrOut);
  if (
    globalThis.statusChannel &&
    globalThis.statusChannel.isTextBased() &&
    !globalThis.statusChannel.isDMBased()
  ) {
    globalThis.statusChannel.send(
      '-# stderr (' +
        config.env +
        ') @ ' +
        new Date().toLocaleTimeString('en-US', {
          timeZone: 'Europe/Berlin',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }) +
        '\n```md\n' +
        stderrCache.join('\n').replace(/(\x9B|\x1B\[)[0-?]*[ -\/]*[@-~]/g, '') +
        '\n```',
    );
    stderrCache = [];
  }
  return originalStderrWrite(buffer, encodingOrCb as any, cb);
};

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

    if (output.includes('\0')) {
      gpt6Process.stdout.off('data', onData);
      resolve(output.replaceAll('\0', '').trimEnd());
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

setInterval(() => gpt6Training(), gpt6TrainInterval);
