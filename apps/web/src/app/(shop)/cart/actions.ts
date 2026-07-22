'use server'

import {
  CouponService,
  RateLimitError,
  enforceRateLimit,
  RATE_LIMITS,
  type CouponValidationResult,
} from '@bharatmart/services'
import { getCurrentUser } from '@/auth'

export async function validateCoupon(
  code: string,
  cartTotalInPence: number,
): Promise<CouponValidationResult> {
  const user = await getCurrentUser()
  const key = user?.id ?? `anon:${code.trim().toLowerCase().slice(0, 32)}`
  try {
    await enforceRateLimit(key, RATE_LIMITS.coupon, 'try another coupon')
  } catch (error) {
    if (error instanceof RateLimitError) {
      return { ok: false, error: error.message }
    }
    throw error
  }
  return CouponService.validate(code, cartTotalInPence)
}
