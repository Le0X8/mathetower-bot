import { prestigeCost } from '$commands/fun/bananen.ts';
import { Buffs, getMutation } from '$commands/fun/mutation.ts';
import { Bananen } from '@/api/bananen.ts';
import {
  maxUpgradeBothBalanced,
  maxUpgradeBothCheapestFirst,
  maxUpgradeLand,
  maxUpgradeMultiplier,
  priceOneLand,
  priceOneMultiplier,
} from '@/lib/plantage-costs.ts';

const infectionChance = (land: number, buff: number) =>
  Math.floor(Math.random() * 1e5) <
  Math.min(1e-9 * land ** 2, 1e3) * (1 - buff / 10);
const infectionGrowthChance = (infection: number) => {
  if (infection < 1 || infection === 100) return false;
  if (infection < 10) return Math.random() < 0.01;
  if (infection < 50) return Math.random() < 0.1;
  if (infection < 75) return Math.random() < 0.05;
  if (infection < 90) return Math.random() < 0.01;
  return Math.random() < 0.005;
};
const mustPrestige = (user: string) =>
  new Bananen(user).getValue() >
  prestigeCost(store.get(user, 'prestige') ?? 0) * 1e3;

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
  mutation: Buffs;

  constructor(uid: string) {
    this.uid = uid;
    this.plantage = store.get(uid, 'plantage') ?? {
      land: 0,
      multiplier: 1,
      infection: 0,
      infectionType: null,
    };
    this.prestige = store.get(uid, 'prestige') ?? 0;
    this.mutation = getMutation(uid);
  }

  maxAllUpgrade(): UpgradeResult {
    if (this.plantage.infection >= 25) return this.maxMultiplierUpgrade();
    /* if (mustPrestige(this.uid))
      return { land: 0, multiplier: 0, spent: 0, remaining: -1 }; */
    const bananen = new Bananen(this.uid);
    const upgrade = maxUpgradeBothCheapestFirst(
      this.plantage.land,
      this.plantage.multiplier,
      bananen.getValue(),
      this.mutation.simplicity,
    );

    bananen.remove(upgrade.spent);

    this.plantage.land += upgrade.newLand;
    this.plantage.multiplier += upgrade.newMultiplier;
    this.save();
    return {
      land: upgrade.newLand,
      multiplier: upgrade.newMultiplier,
      spent: upgrade.spent,
      remaining: bananen.getValue(),
    };
  }

  maxAllUpgradeBalanced(): UpgradeResult {
    if (this.plantage.infection >= 25) return this.maxMultiplierUpgrade();
    /* if (mustPrestige(this.uid))
      return { land: 0, multiplier: 0, spent: 0, remaining: -1 }; */
    const bananen = new Bananen(this.uid);
    const upgrade = maxUpgradeBothBalanced(
      this.plantage.land,
      this.plantage.multiplier,
      bananen.getValue(),
      this.mutation.simplicity,
    );

    bananen.remove(upgrade.spent);

    this.plantage.land += upgrade.newLand;
    this.plantage.multiplier += upgrade.newMultiplier;
    this.save();
    return {
      land: upgrade.newLand,
      multiplier: upgrade.newMultiplier,
      spent: upgrade.spent,
      remaining: bananen.getValue(),
    };
  }

  maxLandUpgrade(): UpgradeResult {
    if (this.plantage.infection >= 25)
      return { land: 0, multiplier: 0, spent: 0, remaining: 0 };
    /* if (mustPrestige(this.uid))
      return { land: 0, multiplier: 0, spent: 0, remaining: -1 }; */
    const bananen = new Bananen(this.uid);
    const upgrade = maxUpgradeLand(
      this.plantage.land,
      bananen.getValue(),
      this.mutation.simplicity,
    );

    bananen.remove(upgrade.spent);

    this.plantage.land += upgrade.newLand;
    this.save();
    return {
      land: upgrade.newLand,
      multiplier: 0,
      spent: upgrade.spent,
      remaining: bananen.getValue(),
    };
  }

  maxMultiplierUpgrade(): UpgradeResult {
    if (this.plantage.infection >= 50)
      return { land: 0, multiplier: 0, spent: 0, remaining: 0 };
    /* if (mustPrestige(this.uid))
      return { land: 0, multiplier: 0, spent: 0, remaining: -1 }; */
    const bananen = new Bananen(this.uid);
    const upgrade = maxUpgradeMultiplier(
      this.plantage.multiplier,
      bananen.getValue(),
      this.mutation.simplicity,
    );

    bananen.remove(upgrade.spent);

    this.plantage.multiplier += upgrade.newMultiplier;
    this.save();
    return {
      land: 0,
      multiplier: upgrade.newMultiplier,
      spent: upgrade.spent,
      remaining: bananen.getValue(),
    };
  }

  landUpgrade(): boolean {
    if (this.plantage.infection >= 25) return false;
    /* if (mustPrestige(this.uid)) return false; */
    const b = new Bananen(this.uid);
    if (
      b.getValue() < priceOneLand(this.plantage.land, this.mutation.simplicity)
    )
      return false;
    this.plantage.land += 1;
    const spentLand = priceOneLand(
      this.plantage.land - 1,
      this.mutation.simplicity,
    );
    b.remove(spentLand);
    this.save();
    return true;
  }

  multiplierUpgrade(): boolean {
    if (this.plantage.infection >= 50) return false;
    /* if (mustPrestige(this.uid)) return false; */
    const b = new Bananen(this.uid);
    if (
      b.getValue() <
      priceOneMultiplier(this.plantage.multiplier, this.mutation.simplicity)
    )
      return false;
    this.plantage.multiplier += 1;
    const spentMultiplier = priceOneMultiplier(
      this.plantage.multiplier - 1,
      this.mutation.simplicity,
    );
    b.remove(spentMultiplier);
    this.save();
    return true;
  }

  multiplierCost(): number {
    return priceOneMultiplier(
      this.plantage.multiplier,
      this.mutation.simplicity,
    );
  }

  landCost(): number {
    return priceOneLand(this.plantage.land, this.mutation.simplicity);
  }

  save(): Plantage {
    store.set(this.uid, 'plantage', this.plantage);
    return this;
  }

  earnings(): number {
    const prestige = this.plantage.infection > 0 ? 0 : this.prestige;
    const infection =
      this.plantage.infection > 0 ? (100 - this.plantage.infection) / 100 : 1;
    return infection === 0
      ? 0
      : (this.plantage.land *
          this.plantage.multiplier *
          (prestige / 2 + 1) *
          (1 + this.mutation.speed * 0.01) *
          (1 + this.mutation.rarity * 0.01)) /
          infection;
  }

  infection(): boolean {
    const cooldown = store.get(this.uid, 'infection-cooldown');
    if (cooldown && Date.now() < cooldown) return false;
    store.set(this.uid, 'infection-cooldown', undefined);
    if (this.plantage.infection === 100) return false;
    if (this.plantage.infection > 0) {
      if (infectionGrowthChance(this.plantage.infection)) {
        this.plantage.infection++;
        this.save();
        return true;
      }
      return false;
    }
    if (infectionChance(this.plantage.land, this.mutation.infection)) {
      this.plantage.infection = 1;
      this.plantage.infectionType =
        String.fromCharCode(0x41 + Math.floor(Math.random() * 26)) +
        Math.floor(Math.random() * 10);
      this.save();
      return true;
    }
    return false;
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
