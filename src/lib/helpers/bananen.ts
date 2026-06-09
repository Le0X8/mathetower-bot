export function amount(a: number): string {
  a = Math.ceil(a);
  const a2 = Math.abs(a);
  if (a2 < 1e3) return `${a.toFixed(2)}`;
  if (a2 < 1e6) return `${(a / 1e3).toFixed(2)}k`;
  if (a2 < 1e9) return `${(a / 1e6).toFixed(2)}M`;
  if (a2 < 1e12) return `${(a / 1e9).toFixed(2)}G`;
  if (a2 < 1e15) return `${(a / 1e12).toFixed(2)}T`;
  if (a2 < 1e18) return `${(a / 1e15).toFixed(2)}P`;
  return `${(a / 1e18).toFixed(2)}E`;
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
  return Math.ceil(price / 1e16) * 1e16;
}
