import 'server-only'

import { addressRepository } from '../repositories/address.repository'
import {
  orderRepository,
  type PlaceGuestOrderInput,
  type PlaceOrderInput,
} from '../repositories/order.repository'
import { NotFoundError, ValidationError } from '../errors'
import { NotificationService } from './notification.service'
import { PaymentService } from './payment.service'

async function notifyOrderParties(order: {
  id: string
  merchantOrders: Array<{ merchantId: string }>
}) {
  try {
    await NotificationService.sendOrderConfirmation(order.id)
  } catch (error) {
    console.error('[orders] Failed to send order confirmation', error)
  }
  for (const merchantOrder of order.merchantOrders) {
    try {
      await NotificationService.notifyMerchantNewOrder(merchantOrder.merchantId, order.id)
    } catch (error) {
      console.error('[orders] Failed to notify merchant of new order', error)
    }
  }
}

/**
 * Card orders are normally finalized by the Stripe webhook. When that never
 * lands (no endpoint configured, local dev, delivery failure) the order stays
 * PENDING with no MerchantOrders and is untrackable, so we ask Stripe directly
 * and finalize here. Safe to call repeatedly — finalizeOrder is idempotent.
 */
async function finalizeIfStripePaid(order: {
  stripePaymentIntentId: string | null
  merchantOrders: unknown[]
}) {
  if (order.merchantOrders.length > 0) return false
  if (!order.stripePaymentIntentId) return false

  try {
    const intent = await PaymentService.getPaymentIntent(order.stripePaymentIntentId)
    if (intent.status !== 'succeeded') return false
    await OrderService.finalizeFromPaymentIntent(order.stripePaymentIntentId)
    return true
  } catch (error) {
    console.error('[orders] Card payment sync failed', error)
    return false
  }
}

async function placePendingAndPay(
  pendingInput: PlaceOrderInput | PlaceGuestOrderInput,
  paymentMeta: {
    customerId?: string | null
    guestEmail?: string | null
  },
) {
  const paymentMethod = pendingInput.paymentMethod ?? 'CARD'
  if (paymentMethod !== 'CARD') {
    throw new ValidationError('Only card payment is available.')
  }

  const pending = await orderRepository.createPendingOrder({
    ...pendingInput,
    paymentMethod: 'CARD',
  })

  // Without Stripe keys a card cannot be charged online yet. Finalize now so
  // the order stays trackable until Stripe is connected.
  if (!process.env.STRIPE_SECRET_KEY) {
    const finalized = await orderRepository.finalizeOrder(pending.id, {
      paymentStatus: 'PENDING',
    })
    await notifyOrderParties(finalized)
    return {
      ...finalized,
      clientSecret: null as string | null,
      finalized: true as const,
    }
  }

  const paymentIntent = await PaymentService.createPaymentIntent({
    amountInPence: pending.totalInPence,
    customerId: paymentMeta.customerId ?? null,
    guestEmail: paymentMeta.guestEmail ?? null,
    orderId: pending.id,
    orderNumber: pending.orderNumber,
  })

  const order = await orderRepository.attachPaymentIntent(pending.id, paymentIntent.id)
  return {
    ...order,
    clientSecret: paymentIntent.client_secret,
    finalized: false as const,
  }
}

export const OrderService = {
  getForCustomer(userId: string) {
    return orderRepository.findForCustomer(userId)
  },

  getById(orderId: string) {
    return orderRepository.findById(orderId)
  },

  getByOrderNumber(orderNumber: string) {
    return orderRepository.findByOrderNumber(orderNumber)
  },

  async trackByOrderNumberAndEmail(orderNumber: string, email: string) {
    const order = await orderRepository.findGuestOrderForTrack(orderNumber, email)
    if (!order) return null
    const finalized = await finalizeIfStripePaid(order)
    return finalized
      ? orderRepository.findGuestOrderForTrack(orderNumber, email)
      : order
  },

  /** Loads an order, finalizing it first if Stripe already took the payment. */
  async getByIdWithPaymentSync(orderId: string) {
    const order = await orderRepository.findById(orderId)
    if (!order) return null
    const finalized = await finalizeIfStripePaid(order)
    return finalized ? orderRepository.findById(orderId) : order
  },

  /** Same as getByIdWithPaymentSync but keyed on the public order number. */
  async getByOrderNumberWithPaymentSync(orderNumber: string) {
    const order = await orderRepository.findByOrderNumber(orderNumber)
    if (!order) return null
    const finalized = await finalizeIfStripePaid(order)
    return finalized ? orderRepository.findByOrderNumber(orderNumber) : order
  },

  /** Called right after a client-side Stripe confirmation succeeds. */
  async syncCardPayment(orderId: string) {
    const order = await orderRepository.findById(orderId)
    if (!order) return false
    return finalizeIfStripePaid(order)
  },

  attachGuestOrdersToUser(userId: string, email: string) {
    return orderRepository.attachGuestOrdersToUser(userId, email)
  },

  /**
   * CARD: create PENDING order + Stripe PaymentIntent; webhook finalizes MerchantOrders.
   */
  async placeOrder(input: PlaceOrderInput) {
    if (!input.items.length) {
      throw new ValidationError('Cart is empty.')
    }

    const address = await addressRepository.findByIdForUser(input.addressId, input.customerId)
    if (!address) {
      throw new NotFoundError('Delivery address not found.')
    }

    try {
      return await placePendingAndPay(input, { customerId: input.customerId })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to place order.'
      throw new ValidationError(message)
    }
  },

  /**
   * Guest checkout: address must already exist (created via createGuestAddress).
   * Never requires a session user.
   */
  async placeGuestOrder(input: PlaceGuestOrderInput) {
    if (!input.items.length) {
      throw new ValidationError('Cart is empty.')
    }

    const address = await addressRepository.findById(input.addressId)
    if (!address || address.userId != null) {
      throw new ValidationError('Delivery address not found.')
    }

    try {
      return await placePendingAndPay(input, {
        customerId: null,
        guestEmail: input.guest.email,
      })
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error instanceof ValidationError
          ? error
          : new ValidationError(error.message)
      }
      const message = error instanceof Error ? error.message : 'Unable to place order.'
      throw new ValidationError(message)
    }
  },

  async finalizeFromPaymentIntent(paymentIntentId: string) {
    const order = await orderRepository.finalizePaidOrder(paymentIntentId)
    await notifyOrderParties(order)
    return order
  },
}

export const orderService = OrderService
