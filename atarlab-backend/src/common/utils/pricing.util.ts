const FREE_SHIPPING_THRESHOLD = 999;
const FLAT_SHIPPING_FEE = 99;
const TAX_RATE = 0.05;

export function computeShippingFee(taxableSubtotal: number): number {
  if (taxableSubtotal <= 0) return 0;
  return taxableSubtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
}

export function computeTax(amount: number): number {
  return round2(Math.max(amount, 0) * TAX_RATE);
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
