/**
 * Formats a number as Indonesian Rupiah.
 * e.g. 1500000 → "Rp 1.500.000"
 */
export function formatRp(amount: number): string {
  return 'Rp\u00A0' + Math.round(amount).toLocaleString('id-ID');
}
