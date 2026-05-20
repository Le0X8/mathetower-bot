import { Banane } from '@/commands/debug/error.ts';

const hour = 60 * 60 * 1000;

let lastPlantageTime = store.get('plantage') ?? Date.now();

interface Plantage {
  land: number;
  multiplier: number;
}

function plantageRoutine() {
  const now = Date.now();
  if (now - lastPlantageTime < hour) return;

  const hoursPassed = Math.floor((now - lastPlantageTime) / hour);
  lastPlantageTime += hoursPassed * hour;
  store.set('plantage', null, lastPlantageTime);

  const plantages: [string, Plantage][] = store.entries('plantage');
  for (const [id, plantage] of plantages) {
    const user = id.split('+')[1];
    const earnings = hoursPassed * plantage.multiplier * plantage.land;
    const balance: Record<Banane, number> = store.get(user, 'banane') ?? {};
    balance[Banane.Geerntet] = (balance[Banane.Geerntet] ?? 0) + earnings;
    store.set(user, 'banane', balance);
  }
}

setInterval(plantageRoutine, 60 * 1000);
