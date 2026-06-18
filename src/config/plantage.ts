import config from '$config' with { type: 'json' };
import { maxUpgrade } from '@/commands/fun/plantage.ts';
import { Bananen, BananeType } from '@/util/bananen.ts';

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
    const prestige = store.get(user, 'prestige') ?? 0;
    const earnings = Math.ceil(
      minutesPassed * plantage.multiplier * plantage.land * (prestige * 2 + 1),
    );
    const balance = new Bananen(user);
    balance.add(BananeType.Geerntet, earnings);
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
  maxUpgrade(
    config.uid,
    store.get(config.uid, 'plantage') ?? { land: 0, multiplier: 1 },
    bal,
    'max',
    money,
  );
}

setInterval(plantageRoutine, 60 * 1000);
