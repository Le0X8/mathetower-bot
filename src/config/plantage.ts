import config from '$config' with { type: 'json' };
import { Bananen, BananeType } from '@/util/bananen.ts';
import { Plantage, RawPlantage } from '@/util/plantage.ts';
import { Client } from 'discord.js';

const minute = 60 * 1000;

let lastPlantageTime = store.get('plantage') ?? Date.now();

export function plantageRoutine(client: Client) {
  const now = Date.now();
  if (now - lastPlantageTime < minute) return;

  const minutesPassed = Math.floor((now - lastPlantageTime) / minute);
  lastPlantageTime += minutesPassed * minute;
  store.set('plantage', null, lastPlantageTime);

  const plantages: [string, RawPlantage][] = store.entries('plantage');
  for (const [id] of plantages) {
    const user = id.split('+')[1];
    const plantage = new Plantage(user);
    plantage.infection();

    if (plantage.plantage.infection === 1) {
      client.users.fetch(user).then((u) => {
        u.send(
          `# Deine Plantage ist infiziert!\nDein Prestige-Bonus ist deaktiviert und du kannst nicht prestigen, bis die Plantage wieder gesund ist.\nBenutze \`/labor\`, um mit der Herstellung eines Gegenmittels zu beginnen.`,
        );
      });
    }
    if (plantage.plantage.infection === 25) {
      client.users.fetch(user).then((u) => {
        u.send(
          `# 25% deiner Plantage sind infiziert!\nDu kannst kein Land mehr kaufen, bis die Plantage wieder gesund ist.\nBenutze \`/labor\`, um mit der Herstellung eines Gegenmittels zu beginnen.`,
        );
      });
    }
    if (plantage.plantage.infection === 50) {
      client.users.fetch(user).then((u) => {
        u.send(
          `# 50% deiner Plantage sind infiziert!\nDu kannst die Plantage nicht mehr upgraden, bis die Plantage wieder gesund ist.\nBenutze \`/labor\`, um mit der Herstellung eines Gegenmittels zu beginnen.`,
        );
      });
    }
    if (plantage.plantage.infection === 75) {
      client.users.fetch(user).then((u) => {
        u.send(
          `# 75% deiner Plantage sind infiziert!\nDie Mutation deiner Plantage ist deaktiviert, bis die Plantage wieder gesund ist.\nBenutze \`/labor\`, um mit der Herstellung eines Gegenmittels zu beginnen.`,
        );
      });
    }
    if (plantage.plantage.infection === 100) {
      client.users.fetch(user).then((u) => {
        u.send(
          `# Deine Plantage ist restlos infiziert!\nDu hast keinen Ertrag aus der Plantage mehr und kannst keine Geschenke mehr senden oder erhalten, bis die Plantage wieder gesund ist.\nBenutze \`/labor\`, um mit der Herstellung eines Gegenmittels zu beginnen.`,
        );
      });
    }

    new Bananen(user).add(
      BananeType.Geerntet,
      plantage.earnings() * minutesPassed,
    );
  }

  const donators: Record<string, number> = store.get('donators') ?? {};
  const bal = new Bananen(config.uid);
  let money = bal.getValue();
  const totalDonations = Object.values(donators).reduce((a, b) => a + b, 0);
  const spendable = Math.floor(money / 2);
  for (const [donator, amount] of Object.entries(donators)) {
    const share = totalDonations > 0 ? amount / totalDonations : 0;
    const payout = Math.floor(spendable * share);
    const balance = new Bananen(donator);
    bal.transfer(balance, payout, true);
    money -= payout;
  }
  new Plantage(config.uid).maxAllUpgrade();
}
