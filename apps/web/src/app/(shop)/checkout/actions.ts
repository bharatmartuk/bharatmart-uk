'use server'

import {
  OrderService,
  RateLimitError,
  ValidationError,
  enforceRateLimit,
  RATE_LIMITS,
} from '@bharatmart/services'
import { getCurrentUser } from '@/auth'

export type PlaceOrderCartItem = {
  productId: string
  quantity: number
}

export type CheckoutPaymentMethod = 'CARD' | 'CASH_ON_DELIVERY'

export type PlaceOrderState =
  | {
      ok: true
      orderId: string
      orderNumber: string
      clientSecret: string | null
      paymentIntentId: string | null
      paymentMethod: CheckoutPaymentMethod
      totalInPence: number
      finalized: boolean
    }
  | { ok: false; error: string }

/**
 * CARD → PENDING order + Stripe PaymentIntent (webhook finalizes).
 * CASH_ON_DELIVERY → order + MerchantOrders immediately (payment collected on delivery).
 */
export async function placeOrder(
  cart: PlaceOrderCartItem[],
  addressId: string,
  paymentMethod: CheckoutPaymentMethod = 'CARD',
): Promise<PlaceOrderState> {
  const user = await getCurrentUser()
  if (!user) {
    return { ok: false, error: 'Please sign in to place an order.' }
  }

  if (!addressId) {
    return { ok: false, error: 'Select a delivery address.' }
  }

  try {
    await enforceRateLimit(user.id, RATE_LIMITS.checkout, 'place another order')
    const order = await OrderService.placeOrder({
      customerId: user.id,
      addressId,
      paymentMethod,
      items: cart,
    })

    return {
      ok: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      clientSecret: order.clientSecret,
      paymentIntentId: order.stripePaymentIntentId,
      paymentMethod,
      totalInPence: order.totalInPence,
      finalized: order.finalized,
    }
  } catch (error) {
    if (error instanceof ValidationError || error instanceof RateLimitError) {
      return { ok: false, error: error.message }
    }
    return { ok: false, error: 'Unable to place order. Please try again.' }
  }
}
