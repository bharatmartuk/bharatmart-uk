'use server'

import { headers } from 'next/headers'
import {
  AddressService,
  OrderService,
  RateLimitError,
  ValidationError,
  clientIpFromHeaders,
  enforceRateLimit,
  RATE_LIMITS,
} from '@bharatmart/services'
import { guestCheckoutSchema } from '@bharatmart/validation'
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
      isGuest: boolean
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
      isGuest: false,
    }
  } catch (error) {
    if (error instanceof ValidationError || error instanceof RateLimitError) {
      return { ok: false, error: error.message }
    }
    return { ok: false, error: 'Unable to place order. Please try again.' }
  }
}

export type PlaceGuestOrderInput = {
  firstName: string
  lastName: string
  email: string
  phone: string
  line1: string
  line2?: string | undefined
  city: string
  county: string
  postcode: string
  country?: string | undefined
  paymentMethod: CheckoutPaymentMethod
  items: PlaceOrderCartItem[]
}

/**
 * Guest checkout — no session required. Creates a guest address then places the order.
 */
export async function placeGuestOrder(input: PlaceGuestOrderInput): Promise<PlaceOrderState> {
  const parsed = guestCheckoutSchema.safeParse({
    contact: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
    },
    address: {
      line1: input.line1,
      line2: input.line2,
      city: input.city,
      county: input.county,
      postcode: input.postcode,
      country: input.country ?? 'GB',
    },
    paymentMethod: input.paymentMethod,
    items: input.items,
  })

  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message
    return { ok: false, error: first ?? 'Please check your details.' }
  }

  try {
    const headerStore = await headers()
    const ip = clientIpFromHeaders(headerStore)
    const emailKey = parsed.data.contact.email.toLowerCase()

    await enforceRateLimit(emailKey, RATE_LIMITS.guestCheckout, 'place another guest order')
    await enforceRateLimit(`ip:${ip}`, RATE_LIMITS.guestCheckout, 'place another guest order')

    const address = await AddressService.createGuestAddress({
      line1: parsed.data.address.line1,
      line2: parsed.data.address.line2,
      city: parsed.data.address.city,
      county: parsed.data.address.county,
      postcode: parsed.data.address.postcode,
      country: parsed.data.address.country,
    })

    const order = await OrderService.placeGuestOrder({
      addressId: address.id,
      paymentMethod: parsed.data.paymentMethod,
      items: parsed.data.items,
      guest: parsed.data.contact,
    })

    return {
      ok: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      clientSecret: order.clientSecret,
      paymentIntentId: order.stripePaymentIntentId,
      paymentMethod: parsed.data.paymentMethod,
      totalInPence: order.totalInPence,
      finalized: order.finalized,
      isGuest: true,
    }
  } catch (error) {
    console.error('[checkout] placeGuestOrder failed', error)
    if (error instanceof ValidationError || error instanceof RateLimitError) {
      return { ok: false, error: error.message }
    }
    const message =
      error instanceof Error ? error.message : 'Unable to place order. Please try again.'
    return { ok: false, error: message }
  }
}
