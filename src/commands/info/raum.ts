import { Command } from '$commands';

interface Raum {
  platform: 'lsf';
  type: 'v' | 's' | 'l';
  id: string | number;
}

const räume: Record<string, Record<string, Raum>> = {
  'HG II': {
    'HS 7': {
      platform: 'lsf',
      type: 'v',
      id: 750,
    },
  },
};

const LSF_URL =
  'https://www.lsf.tu-dortmund.de/qisserver/rds?state=wplan&act=Raum&pool=Raum&raum.rgid=';

async function getAvailability(raum: Raum): Promise<void> {
  switch (raum.platform) {
    case 'lsf':
      store.cache(
        `raum-lsf-${raum.id}`,
        new Date().toISOString().split('T')[0],
        async () => {
          const html = await fetch(LSF_URL + raum.id).then((res) => res.text());
        },
      );
  }
}

export default new Command('raum', 'Sucht freie Räume', async (interaction) => {
  console.log(await getAvailability(räume['HG II']['HS 7']));
  await interaction.reply({ content: '//todo', ephemeral: true });
});
