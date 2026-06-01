export function amount(amount: number): string {
  if (amount < 1e3) return `${amount}`;
  if (amount < 1e6) return `${(amount / 1e3).toFixed(2)}k`;
  if (amount < 1e9) return `${(amount / 1e6).toFixed(2)}M`;
  if (amount < 1e12) return `${(amount / 1e9).toFixed(2)}G`;
  if (amount < 1e15) return `${(amount / 1e12).toFixed(2)}T`;
  if (amount < 1e18) return `${(amount / 1e15).toFixed(2)}P`;
  return `${(amount / 1e18).toFixed(2)}E`;
}

export function nb(amount: number): string {
  return `${amount}\u0e3f`;
}

export function priceAdjust(price: number): number {
  if (price < 1e3) return price;
  if (price < 1e6) return Math.ceil(price / 1e1) * 1e1;
  if (price < 1e9) return Math.ceil(price / 1e4) * 1e4;
  if (price < 1e12) return Math.ceil(price / 1e7) * 1e7;
  if (price < 1e15) return Math.ceil(price / 1e10) * 1e10;
  if (price < 1e18) return Math.ceil(price / 1e13) * 1e13;
  return Math.ceil(price / 1e16) * 1e16;
}
