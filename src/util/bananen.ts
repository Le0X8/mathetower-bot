export class Bananen {
  uid: string;
  bananen: Record<BananeType, number>;

  constructor(uid: string) {
    this.uid = uid;
    this.bananen = store.get(uid, 'banane') ?? {};
  }

  normalize(): Bananen {
    if (
      this.bananen[BananeType.Verkauft] > 0 &&
      this.bananen[BananeType.Geerntet] > 0
    ) {
      const diff = Math.min(
        this.bananen[BananeType.Verkauft],
        this.bananen[BananeType.Geerntet],
      );
      this.bananen[BananeType.Verkauft] -= diff;
      this.bananen[BananeType.Geerntet] -= diff;
    }

    if (
      this.bananen[BananeType.Verkauft] > 0 &&
      this.bananen[BananeType.Gelb] > 0
    ) {
      const diff = Math.min(
        this.bananen[BananeType.Verkauft],
        this.bananen[BananeType.Gelb],
      );
      this.bananen[BananeType.Verkauft] -= diff;
      this.bananen[BananeType.Gelb] -= diff;
    }

    Object.entries(this.bananen).forEach(([key, val]) => {
      const banane = parseInt(key) as BananeType;
      const strings = bananeStrings(banane);
      if (typeof strings == 'undefined' || val == 0)
        delete this.bananen[parseInt(key) as BananeType];
    });

    return this.save();
  }

  save(): Bananen {
    store.set(this.uid, 'banane', this.bananen);
    return this;
  }

  getValue(): number {
    return Object.entries(this.bananen).reduce(
      (prev, [key, count]) =>
        prev + (bananeValues[parseInt(key) as BananeType] ?? 0) * count,
      0,
    );
  }

  addRandom(): {
    strs: [string, string, string];
    count: number;
    value: number;
  } {
    const rng = Math.ceil(Math.random() * 100000);

    let banane: BananeType = BananeType.Gelb;
    for (const range of Object.entries(bananeRanges))
      if (rng <= range[1]) banane = parseInt(range[0]) as BananeType;

    if (typeof this.bananen[banane] != 'number') this.bananen[banane] = 0;
    this.bananen[banane]++;
    this.save();

    return {
      strs: bananeStrings(banane),
      count: this.bananen[banane],
      value: bananeValues[banane] ?? 0,
    };
  }

  reset(): Bananen {
    this.bananen = {} as unknown as Record<BananeType, number>;
    return this.save();
  }

  add(banane: BananeType, count: number): Bananen {
    if (typeof this.bananen[banane] != 'number') this.bananen[banane] = 0;
    this.bananen[banane] += count;
    return this.normalize();
  }

  setValue(value: number): Bananen {
    this.bananen = {
      [BananeType.Gelb]: value,
    } as unknown as Record<BananeType, number>;
    return this.save();
  }

  remove(amount: number): Bananen {
    return this.add(BananeType.Verkauft, amount);
  }

  transfer(target: Bananen, amount: number, farmed?: boolean): boolean {
    if (this.getValue() < amount) return false;
    this.remove(amount);
    target.add(farmed ? BananeType.Geerntet : BananeType.Gelb, amount);
    return true;
  }
}

export enum BananeType {
  Gelb = 0, // 60%
  Grün = 1, // 29%
  Braun = 2, // 10%
  Bewaffnet = 99, // 1%
  Geerntet = 198, // 0%
  Sbahn = 199, // 0%
  Verkauft = 200, // 0%
}

export function bananeStrings(banane: BananeType): [string, string, string] {
  switch (banane) {
    case BananeType.Gelb:
      return [
        'normale gelbe',
        '<:normal:1505971920858779800>',
        'da ist wirklich nix besonderes dran 🫩✌️🥀',
      ];
    case BananeType.Grün:
      return [
        'unreife grüne',
        '<:gruen:1505973348876943493>',
        "vielleicht bisschen hart aber wer's mag :(",
      ];
    case BananeType.Braun:
      return [
        'vergammelte braune',
        '<:braun:1505973784249761923>',
        'würd ich jetzt nicht mehr essen 🤮',
      ];
    case BananeType.Bewaffnet:
      return [
        'schwer bewaffnete 😳',
        '<:bewaffnet:1505976549051207760>',
        '🤚 "Hände hoch" ✋',
      ];
    case BananeType.Verkauft:
      return ['verkaufte', '💰', 'Diese Banane wurde verkauft!'];
    case BananeType.Sbahn:
      return [
        'S-Bahnanen, sehr S1-ige',
        '<:sbahnane:1506733319188910210>',
        'Umgewandelt aus deinen gesammelten Verspätungsminuten der S1!',
      ];
    case BananeType.Geerntet:
      return [
        'geerntete',
        '<:geerntet:1506742225613099098>',
        'gewachsen auf einer Bio-`/plantage`!',
      ];
  }
}

const bananeRanges: Record<BananeType, number> = {
  [BananeType.Gelb]: 60000,
  [BananeType.Grün]: 89000,
  [BananeType.Braun]: 99000,
  [BananeType.Bewaffnet]: 100000,
  [BananeType.Verkauft]: -1,
  [BananeType.Sbahn]: -1,
  [BananeType.Geerntet]: -1,
};

export const bananeValues: Record<BananeType, number> = {
  [BananeType.Gelb]: 1,
  [BananeType.Grün]: 2,
  [BananeType.Braun]: 0,
  [BananeType.Bewaffnet]: 100,
  [BananeType.Verkauft]: -1,
  [BananeType.Sbahn]: 10,
  [BananeType.Geerntet]: 1,
};
