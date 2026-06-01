import { Banane } from '@/commands/debug/error.ts';
import config from '$config' with { type: 'json' };
import { maxUpgrade } from '@/commands/fun/plantage.ts';

const minute = 60 * 1000;

let lastPlantageTime = store.get('plantage') ?? Date.now();

interface Plantage {
  land: number;
  multiplier: number;
}

function plantageRoutine() {
  const now = Date.now();
  if (now - lastPlantageTime < minute) return;

  const minutesPassed = Math.floor((now - lastPlantageTime) / minute);
  lastPlantageTime += minutesPassed * minute;
  store.set('plantage', null, lastPlantageTime);

  const plantages: [string, Plantage][] = store.entries('plantage');
  for (const [id, plantage] of plantages) {
    const user = id.split('+')[1];
    const earnings = minutesPassed * plantage.multiplier * plantage.land;
    const balance: Record<Banane, number> = store.get(user, 'banane') ?? {};
    balance[Banane.Geerntet] = (balance[Banane.Geerntet] ?? 0) + earnings;
    store.set(user, 'banane', balance);
  }

  const donators: Record<string, number> = store.get('donators') ?? {};
  const bal = store.get(config.uid, 'banane') ?? {};
  let money = (bal[Banane.Gelb] ?? 0) + (bal[Banane.Geerntet] ?? 0);
  const totalDonations = Object.values(donators).reduce((a, b) => a + b, 0);
  const spendable = Math.floor(money / 2);
  for (const [donator, amount] of Object.entries(donators)) {
    const share = totalDonations > 0 ? amount / totalDonations : 0;
    const payout = Math.floor(spendable * share);
    const balance: Record<Banane, number> = store.get(donator, 'banane') ?? {};
    balance[Banane.Geerntet] = (balance[Banane.Geerntet] ?? 0) + payout;
    store.set(donator, 'banane', balance);
    bal[Banane.Verkauft] = (bal[Banane.Verkauft] ?? 0) + payout;
    money -= payout;
  }
  store.set(config.uid, 'banane', bal);
  maxUpgrade(
    config.uid,
    store.get(config.uid, 'plantage') ?? { land: 0, multiplier: 1 },
    bal,
    'maxbalance',
    money,
  );
}

setInterval(plantageRoutine, 60 * 1000);
