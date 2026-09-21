export const COMPARE_COST = 2;
export const REGISTER_BONUS = 4;
export const TOKEN_PRICE_RP = 500;

export function formatRp(n: number): string {
  return `Rp${n.toLocaleString("id-ID")}`;
}
