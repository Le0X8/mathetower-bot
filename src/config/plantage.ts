import config from '$config' with { type: 'json' };
import { Bananen, BananeType } from '@/util/bananen.ts';
import { Plantage, RawPlantage } from '@/util/plantage.ts';

const minute = 60 * 1000;

let lastPlantageTime = store.get('plantage') ?? Date.now();

function plantageRoutine() {
  const now = Date.now();
  if (now - lastPlantageTime < minute) return;

  const minutesPassed = Math.floor((now - lastPlantageTime) / minute);
  lastPlantageTime += minutesPassed * minute;
  store.set('plantage', null, lastPlantageTime);

  const plantages: [string, RawPlantage][] = store.entries('plantage');
  for (const [id] of plantages) {
    const user = id.split('+')[1];
    const plantage = new Plantage(user);
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

setInterval(plantageRoutine, 60 * 1000);
