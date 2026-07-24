/**
 * UK postcode helpers for delivery-area matching.
 * Merchants store outward codes (e.g. E14, LE1); customers often enter full postcodes.
 */

const FULL_POSTCODE_RE =
  /^([A-Z]{1,2}\d[A-Z\d]?)\s*(\d[A-Z]{2})$/i
const OUTWARD_ONLY_RE = /^([A-Z]{1,2}\d[A-Z\d]?)$/i

/** Normalize spacing/case: "e14  8px" → "E14 8PX" */
export function normalizeUkPostcode(input: string): string {
  return input.trim().replace(/\s+/g, ' ').toUpperCase()
}

/**
 * Extract the outward code used for merchant delivery matching.
 * "E14 8PX" → "E14", "LE1" → "LE1"
 */
export function ukOutwardCode(input: string): string | null {
  const normalized = normalizeUkPostcode(input)
  if (!normalized) return null

  const full = FULL_POSTCODE_RE.exec(normalized)
  if (full?.[1]) return full[1].toUpperCase()

  const outward = OUTWARD_ONLY_RE.exec(normalized.replace(/\s/g, ''))
  if (outward?.[1]) return outward[1].toUpperCase()

  return null
}

/** Accept full UK postcode or outward-only area code. */
export function isValidUkPostcodeInput(input: string): boolean {
  return ukOutwardCode(input) != null
}

/** Display form for cookies / UI. */
export function formatUkPostcodeForDisplay(input: string): string {
  const normalized = normalizeUkPostcode(input)
  const full = FULL_POSTCODE_RE.exec(normalized)
  if (full?.[1] && full[2]) return `${full[1].toUpperCase()} ${full[2].toUpperCase()}`
  const outward = ukOutwardCode(normalized)
  return outward ?? normalized
}
