'use server'

import { CouponService, type CouponValidationResult } from '@bharatmart/services'

export async function validateCoupon(
  code: string,
  cartTotalInPence: number,
): Promise<CouponValidationResult> {
  return CouponService.validate(code, cartTotalInPence)
}
