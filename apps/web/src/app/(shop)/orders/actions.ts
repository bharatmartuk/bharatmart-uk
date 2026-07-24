'use server'

import { headers } from 'next/headers'
import {
  OrderService,
  RateLimitError,
  clientIpFromHeaders,
  enforceRateLimit,
  RATE_LIMITS,
} from '@bharatmart/services'
import { guestOrderTrackSchema } from '@bharatmart/validation'

export type TrackOrderState =
  | {
      ok: true
      order: {
        orderNumber: string
        placedAt: string
        paymentStatus: string
        paymentMethod: string
        totalInPence: number
        address: {
          line1: string
          line2: string | null
          city: string
          county: string | null
          postcode: string
        }
        merchantOrders: Array<{
          id: string
          status: string
          storeName: string
          trackingNumber: string | null
          courierName: string | null
          items: Array<{
            name: string
            quantity: number
            priceInPence: number
          }>
        }>
      }
    }
  | { ok: false; error: string }

export async function trackGuestOrderAction(input: {
  orderNumber: string
  email: string
}): Promise<TrackOrderState> {
  const parsed = guestOrderTrackSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid details.' }
  }

  try {
    const headerStore = await headers()
    const ip = clientIpFromHeaders(headerStore)
    await enforceRateLimit(
      `${ip}:${parsed.data.email.toLowerCase()}`,
      RATE_LIMITS.guestTrack,
      'look up another order',
    )

    const order = await OrderService.trackByOrderNumberAndEmail(
      parsed.data.orderNumber,
      parsed.data.email,
    )

    if (!order) {
      return { ok: false, error: 'No order found for that number and email.' }
    }

    return {
      ok: true,
      order: {
        orderNumber: order.orderNumber,
        placedAt: order.placedAt.toISOString(),
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        totalInPence: order.totalInPence,
        address: {
          line1: order.address.line1,
          line2: order.address.line2,
          city: order.address.city,
          county: order.address.county,
          postcode: order.address.postcode,
        },
        merchantOrders: order.merchantOrders.map((mo) => ({
          id: mo.id,
          status: mo.status,
          storeName: mo.merchant.storeName,
          trackingNumber: mo.trackingNumber,
          courierName: mo.courierName,
          items: mo.orderItems.map((item) => ({
            name: item.productNameSnapshot,
            quantity: item.quantity,
            priceInPence: item.priceInPenceSnapshot,
          })),
        })),
      },
    }
  } catch (error) {
    if (error instanceof RateLimitError) {
      return { ok: false, error: error.message }
    }
    return { ok: false, error: 'Unable to look up that order. Please try again.' }
  }
}
