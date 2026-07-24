import { cookies } from 'next/headers'
import {
  formatUkPostcodeForDisplay,
  isValidUkPostcodeInput,
  ukOutwardCode,
} from '@bharatmart/utils'
import { AddressService } from '@bharatmart/services'
import type { CustomerLocation } from '@/lib/customer-location-types'

export type { CustomerLocation, LocationStatus } from '@/lib/customer-location-types'

export const LOCATION_POSTCODE_COOKIE = 'bharatmart_postcode'
export const LOCATION_STATUS_COOKIE = 'bharatmart_location_status'
export const LOCATION_COOKIE_MAX_AGE = 60 * 60 * 24 * 365 // 1 year

function cookieOptions() {
  return {
    path: '/',
    maxAge: LOCATION_COOKIE_MAX_AGE,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
  }
}

function fromPostcode(postcode: string, source: 'guest' | 'account'): CustomerLocation {
  const area = ukOutwardCode(postcode)
  if (!area) {
    return { status: 'skipped', postcode: null, area: null, source }
  }
  return {
    status: 'set',
    postcode: formatUkPostcodeForDisplay(postcode),
    area,
    source,
  }
}

/**
 * Resolve delivery location for browse filtering.
 * Logged-in users use their saved address postcode (no postcode gate).
 * Guests use the cookie from the first-visit prompt.
 */
export async function getCustomerLocation(userId?: string | null): Promise<CustomerLocation> {
  if (userId) {
    const addresses = await AddressService.getForUser(userId)
    const preferred =
      addresses.find((address) => address.isDefault) ?? addresses[0] ?? null
    if (preferred?.postcode) {
      return fromPostcode(preferred.postcode, 'account')
    }
    // Signed in but no address yet - don't prompt; they'll add postcode on checkout/account
    return { status: 'skipped', postcode: null, area: null, source: 'account' }
  }

  const jar = await cookies()
  const statusRaw = jar.get(LOCATION_STATUS_COOKIE)?.value
  const postcodeRaw = jar.get(LOCATION_POSTCODE_COOKIE)?.value

  if (statusRaw === 'skipped') {
    return { status: 'skipped', postcode: null, area: null, source: 'guest' }
  }

  if (statusRaw === 'set' && postcodeRaw) {
    return fromPostcode(postcodeRaw, 'guest')
  }

  return { status: 'unknown', postcode: null, area: null, source: 'guest' }
}

/** Called from server actions only (cookies().set). Guests only. */
export async function persistCustomerPostcode(raw: string) {
  if (!isValidUkPostcodeInput(raw)) {
    return { ok: false as const, error: 'Enter a valid UK postcode (e.g. E14 8PX or E14).' }
  }

  const display = formatUkPostcodeForDisplay(raw)
  const jar = await cookies()
  jar.set(LOCATION_POSTCODE_COOKIE, display, cookieOptions())
  jar.set(LOCATION_STATUS_COOKIE, 'set', cookieOptions())
  return { ok: true as const, postcode: display, area: ukOutwardCode(display)! }
}

export async function persistLocationSkipped() {
  const jar = await cookies()
  jar.delete(LOCATION_POSTCODE_COOKIE)
  jar.set(LOCATION_STATUS_COOKIE, 'skipped', cookieOptions())
  return { ok: true as const }
}

export async function clearCustomerLocation() {
  const jar = await cookies()
  jar.delete(LOCATION_POSTCODE_COOKIE)
  jar.delete(LOCATION_STATUS_COOKIE)
  return { ok: true as const }
}
