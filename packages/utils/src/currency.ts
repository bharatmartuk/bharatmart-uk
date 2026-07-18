const gbpFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

/** Format integer pence/minor units as GBP (never use floats for money). */
export function formatGBP(amountInPence: number): string {
  return gbpFormatter.format(amountInPence / 100)
}
