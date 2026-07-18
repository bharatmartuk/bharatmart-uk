import 'server-only'

import { couponRepository } from '../repositories/coupon.repository'

export type CouponValidationResult =
  | { ok: true; code: string; discountInPence: number; discountType: 'PERCENTAGE' | 'FIXED' }
  | { ok: false; error: string }

export const CouponService = {
  async validate(code: string, cartTotalInPence: number): Promise<CouponValidationResult> {
    if (!code.trim()) {
      return { ok: false, error: 'Enter a coupon code.' }
    }

    if (cartTotalInPence <= 0) {
      return { ok: false, error: 'Your cart is empty.' }
    }

    const coupon = await couponRepository.findByCode(code)
    if (!coupon) {
      return { ok: false, error: 'Coupon not found.' }
    }

    if (coupon.expiresAt.getTime() < Date.now()) {
      return { ok: false, error: 'This coupon has expired.' }
    }

    if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
      return { ok: false, error: 'This coupon has reached its usage limit.' }
    }

    if (coupon.minOrderValueInPence != null && cartTotalInPence < coupon.minOrderValueInPence) {
      return {
        ok: false,
        error: `Minimum order value is £${(coupon.minOrderValueInPence / 100).toFixed(2)}.`,
      }
    }

    const discountInPence =
      coupon.discountType === 'PERCENTAGE'
        ? Math.min(
            cartTotalInPence,
            Math.floor((cartTotalInPence * coupon.discountValue) / 100),
          )
        : Math.min(cartTotalInPence, coupon.discountValue)

    if (discountInPence <= 0) {
      return { ok: false, error: 'Coupon does not apply a valid discount.' }
    }

    return {
      ok: true,
      code: coupon.code,
      discountInPence,
      discountType: coupon.discountType,
    }
  },
}

export const couponService = CouponService
