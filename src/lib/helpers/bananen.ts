export function amount(a: number): string {
  a = Math.ceil(a);
  const a2 = Math.abs(a);
  if (a2 < 1e3) return `${a.toFixed(2)}`;
  if (a2 < 1e6) return `${(a / 1e3).toFixed(2)}k`;
  if (a2 < 1e9) return `${(a / 1e6).toFixed(2)}M`;
  if (a2 < 1e12) return `${(a / 1e9).toFixed(2)}G`;
  if (a2 < 1e15) return `${(a / 1e12).toFixed(2)}T`;
  if (a2 < 1e18) return `${(a / 1e15).toFixed(2)}P`;
  if (a2 < 1e21) return `${(a / 1e18).toFixed(2)}E`;
  if (a2 < 1e24) return `${(a / 1e21).toFixed(2)}Z`;
  if (a2 < 1e27) return `${(a / 1e24).toFixed(2)}Y`;
  if (a2 < 1e30) return `${(a / 1e27).toFixed(2)}R`;
  return `${(a / 1e30).toFixed(2)}Q`;
}

export function nb(a: number): string {
  return `${amount(a)}\u0e3f`;
}

export function priceAdjust(price: number): number {
  if (price < 1e3) return Math.ceil(price);
  if (price < 1e6) return Math.ceil(price / 1e1) * 1e1;
  if (price < 1e9) return Math.ceil(price / 1e4) * 1e4;
  if (price < 1e12) return Math.ceil(price / 1e7) * 1e7;
  if (price < 1e15) return Math.ceil(price / 1e10) * 1e10;
  if (price < 1e18) return Math.ceil(price / 1e13) * 1e13;
  if (price < 1e21) return Math.ceil(price / 1e16) * 1e16;
  if (price < 1e24) return Math.ceil(price / 1e19) * 1e19;
  if (price < 1e27) return Math.ceil(price / 1e22) * 1e22;
  if (price < 1e30) return Math.ceil(price / 1e25) * 1e25;
  return Math.ceil(price / 1e28) * 1e28;
}

export function fromAmount(a: string): number {
  const amount = parseFloat(a);
  const suffix = a.slice(-1);
  switch (suffix) {
    case 'k':
      return amount * 1e3;
    case 'M':
      return amount * 1e6;
    case 'G':
      return amount * 1e9;
    case 'T':
      return amount * 1e12;
    case 'P':
      return amount * 1e15;
    case 'E':
      return amount * 1e18;
    case 'Z':
      return amount * 1e21;
    case 'Y':
      return amount * 1e24;
    case 'R':
      return amount * 1e27;
    case 'Q':
      return amount * 1e30;
    default:
      return amount;
  }
}
