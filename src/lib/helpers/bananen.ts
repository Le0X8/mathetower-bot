const suffixes = [
  'k',
  'M',
  'B',
  'T',
  'Qa',
  'Qi',
  'Sx',
  'Sp',
  'Oc',
  'No',
  'Dc',
  'Ud',
  'Dd',
  'Td',
  'Qad',
  'Qid',
  'Sxd',
  'Spd',
  'Ocd',
  'Nod',
  'Vg',
  'Uvg',
  'Dvg',
  'Tvg',
  'Qavg',
  'Qivg',
  'Sxvg',
  'Spvg',
  'Ocvg',
  'Novg',
  'Tg',
  'Utg',
  'Dtg',
  'Ttg',
  'Qaqg',
  'Qiqg',
  'Sxqg',
  'Spqg',
  'Ocqg',
  'Noqg',
  'Qqg',
];

export function amount(a: number): string {
  a = Math.ceil(a);
  const a2 = Math.abs(a);

  for (let i = 0; i < suffixes.length; i++) {
    const max = Math.pow(10, (i + 1) * 3);
    if (a2 < max) {
      const value = a / Math.pow(10, i * 3);
      return `${value.toFixed(2)} ${suffixes[i]}`;
    }
  }

  return a.toFixed(2);
}

export function nb(a: number): string {
  return `${amount(a)} \u0e3f`;
}

export function priceAdjust(price: number): number {
  for (let i = 0; i < suffixes.length; i++) {
    const max = Math.pow(10, (i + 1) * 3);
    if (price < max) {
      const value = price / Math.pow(10, i * 3);
      return Math.ceil(value) * Math.pow(10, i * 3);
    }
  }

  return price;
}

export function fromAmount(a: string): number {
  const amount = parseFloat(a);
  const suffix = a.replace(amount.toString(), '').toLowerCase();

  for (let i = 0; i < suffixes.length; i++) {
    if (suffix === suffixes[i].toLowerCase()) {
      return amount * Math.pow(10, i * 3);
    }
  }

  return amount;
}
