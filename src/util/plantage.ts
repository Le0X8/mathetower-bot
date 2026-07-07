import { priceAdjust } from '@/lib/helpers/bananen.ts';
import { Bananen } from '@/util/bananen.ts';

const multiplierPrice = (multiplier: number) =>
  priceAdjust(
    multiplier < 50
      ? multiplier ** 1.5 * 5 + 100
      : multiplier < 100
        ? multiplier ** 1.5 * 10 + 100
        : multiplier ** 2 * 10 + 100,
  );
const landPrice = (land: number) =>
  priceAdjust(
    land < 1
      ? 0
      : land < 50
        ? land * 20 - 10
        : land < 100
          ? land * 200 - 100
          : land * 2000 - 1000,
  );
const infectionChance = (land: number) =>
  Math.floor(Math.random() * 1e5) < Math.min(1e-9 * land ** 2, 1e3);
const infectionGrowthChance = (infection: number) => {
  if (infection < 1 || infection === 100) return false;
  if (infection < 10) return Math.random() < 0.01;
  if (infection < 50) return Math.random() < 0.1;
  if (infection < 75) return Math.random() < 0.05;
  if (infection < 90) return Math.random() < 0.01;
  return Math.random() < 0.005;
};

export interface RawPlantage {
  land: number;
  multiplier: number;
  infection: number;
  infectionType: string | null;
}

export interface UpgradeResult {
  land: number;
  multiplier: number;
  spent: number;
  remaining: number;
}

export class Plantage {
  uid: string;
  plantage: RawPlantage;
  prestige: number;

  constructor(uid: string) {
    this.uid = uid;
    this.plantage = store.get(uid, 'plantage') ?? {
      land: 0,
      multiplier: 1,
      infection: 0,
      infectionType: null,
    };
    this.prestige = store.get(uid, 'prestige') ?? 0;
  }

  maxAllUpgrade(): UpgradeResult {
    if (this.plantage.infection >= 25) return this.maxMultiplierUpgrade();
    const startMultiplier = this.plantage.multiplier;
    const startLand = this.plantage.land;
    const bananen = new Bananen(this.uid);
    const value = bananen.getValue();
    const startValue = value;
    let money = value;
    while (true) {
      const multiplierCost = multiplierPrice(this.plantage.multiplier);
      const landCost = landPrice(this.plantage.land);
      if (multiplierCost < landCost && money >= multiplierCost) {
        money -= multiplierCost;
        this.plantage.multiplier += 1;
      } else if (money >= landCost) {
        money -= landCost;
        this.plantage.land += 1;
      } else {
        break;
      }
    }

    const spent = startValue - money;
    bananen.remove(spent);

    this.save();
    return {
      land: this.plantage.land - startLand,
      multiplier: this.plantage.multiplier - startMultiplier,
      spent,
      remaining: money,
    };
  }

  maxAllUpgradeBalanced(): UpgradeResult {
    if (this.plantage.infection >= 25) return this.maxMultiplierUpgrade();
    const startMultiplier = this.plantage.multiplier;
    const startLand = this.plantage.land;
    const bananen = new Bananen(this.uid);
    const value = bananen.getValue();
    const startValue = value;
    let money = value;
    while (true) {
      const multiplierCost = multiplierPrice(this.plantage.multiplier);
      const landCost = landPrice(this.plantage.land);
      if (
        this.plantage.multiplier <= this.plantage.land &&
        money >= multiplierCost
      ) {
        money -= multiplierCost;
        this.plantage.multiplier += 1;
      } else if (
        this.plantage.multiplier > this.plantage.land &&
        money >= landCost
      ) {
        money -= landCost;
        this.plantage.land += 1;
      } else {
        break;
      }
    }

    const spent = startValue - money;
    bananen.remove(spent);

    this.save();
    return {
      land: this.plantage.land - startLand,
      multiplier: this.plantage.multiplier - startMultiplier,
      spent,
      remaining: money,
    };
  }

  maxLandUpgrade(): UpgradeResult {
    if (this.plantage.infection >= 25)
      return { land: 0, multiplier: 0, spent: 0, remaining: 0 };
    const startMultiplier = this.plantage.multiplier;
    const startLand = this.plantage.land;
    const bananen = new Bananen(this.uid);
    const value = bananen.getValue();
    const startValue = value;
    let money = value;
    while (true) {
      const landCost = landPrice(this.plantage.land);
      if (money >= landCost) {
        money -= landCost;
        this.plantage.land += 1;
      } else {
        break;
      }
    }

    const spent = startValue - money;
    bananen.remove(spent);

    this.save();
    return {
      land: this.plantage.land - startLand,
      multiplier: this.plantage.multiplier - startMultiplier,
      spent,
      remaining: money,
    };
  }

  maxMultiplierUpgrade(): UpgradeResult {
    if (this.plantage.infection >= 50)
      return { land: 0, multiplier: 0, spent: 0, remaining: 0 };
    const startMultiplier = this.plantage.multiplier;
    const startLand = this.plantage.land;
    const bananen = new Bananen(this.uid);
    const value = bananen.getValue();
    const startValue = value;
    let money = value;
    while (true) {
      const multiplierCost = multiplierPrice(this.plantage.multiplier);
      if (money >= multiplierCost) {
        money -= multiplierCost;
        this.plantage.multiplier += 1;
      } else {
        break;
      }
    }

    const spent = startValue - money;
    bananen.remove(spent);

    this.save();
    return {
      land: this.plantage.land - startLand,
      multiplier: this.plantage.multiplier - startMultiplier,
      spent,
      remaining: money,
    };
  }

  landUpgrade(): boolean {
    if (this.plantage.infection >= 25) return false;
    const b = new Bananen(this.uid);
    if (b.getValue() < landPrice(this.plantage.land)) return false;
    this.plantage.land += 1;
    const spentLand = landPrice(this.plantage.land - 1);
    b.remove(spentLand);
    this.save();
    return true;
  }

  multiplierUpgrade(): boolean {
    if (this.plantage.infection >= 50) return false;
    const b = new Bananen(this.uid);
    if (b.getValue() < multiplierPrice(this.plantage.multiplier)) return false;
    this.plantage.multiplier += 1;
    const spentMultiplier = multiplierPrice(this.plantage.multiplier - 1);
    b.remove(spentMultiplier);
    this.save();
    return true;
  }

  save(): Plantage {
    store.set(this.uid, 'plantage', this.plantage);
    return this;
  }

  earnings(): number {
    const prestige = this.plantage.infection > 0 ? 0 : this.prestige;
    const infection =
      this.plantage.infection > 0 ? (100 - this.plantage.infection) / 100 : 1;
    return (
      (this.plantage.land * this.plantage.multiplier * (prestige * 2 + 1)) /
      infection
    );
  }

  infection(): Plantage {
    if (this.plantage.infection === 100) return this;
    if (this.plantage.infection > 0) {
      if (infectionGrowthChance(this.plantage.infection)) {
        this.plantage.infection++;
        this.save();
      }
      return this;
    }
    if (infectionChance(this.plantage.land)) {
      this.plantage.infection = 1;
      this.plantage.infectionType =
        String.fromCharCode(0x41 + Math.floor(Math.random() * 26)) +
        Math.floor(Math.random() * 10);
      this.save();
    }
    return this;
  }

  reset(): Plantage {
    this.plantage = {
      land: 0,
      multiplier: 1,
      infection: 0,
      infectionType: null,
    };
    this.save();
    return this;
  }
}
