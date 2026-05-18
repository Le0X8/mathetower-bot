import { Command } from '$commands';

export default new Command('error', 'schlägt fehl', async (_interaction) => {
  throw new Error('banane 🍌');
});
