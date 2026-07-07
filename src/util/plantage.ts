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

export interface RawPlantage {
  land: number;
  multiplier: number;
  infection: number;
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
    };
    this.prestige = store.get(uid, 'prestige') ?? 0;
  }

  maxAllUpgrade(): UpgradeResult {
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
    const b = new Bananen(this.uid);
    if (b.getValue() < landPrice(this.plantage.land)) return false;
    this.plantage.land += 1;
    const spentLand = landPrice(this.plantage.land - 1);
    b.remove(spentLand);
    this.save();
    return true;
  }

  multiplierUpgrade(): boolean {
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
    return (
      this.plantage.land * this.plantage.multiplier * (this.prestige * 2 + 1)
    );
  }

  reset(): Plantage {
    this.plantage = {
      land: 0,
      multiplier: 1,
      infection: 0,
    };
    this.save();
    return this;
  }
}
