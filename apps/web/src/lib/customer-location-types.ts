export type LocationStatus = 'set' | 'skipped' | 'unknown'

export type CustomerLocation = {
  status: LocationStatus
  /** Display postcode (full or outward). */
  postcode: string | null
  /** Outward code used to match Merchant.deliveryPostcodes. */
  area: string | null
  /**
   * guest = cookie postcode gate
   * account = logged-in user; postcode comes from saved address (no gate)
   */
  source: 'guest' | 'account'
}
