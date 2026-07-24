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

async function placePendingAndPay(
  pendingInput: PlaceOrderInput | PlaceGuestOrderInput,
  paymentMeta: {
    customerId?: string | null
    guestEmail?: string | null
  },
) {
  const paymentMethod = pendingInput.paymentMethod ?? 'CARD'
  const pending = await orderRepository.createPendingOrder({
    ...pendingInput,
    paymentMethod,
  })

  if (paymentMethod === 'CASH_ON_DELIVERY') {
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

  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      ...pending,
      clientSecret: null as string | null,
      finalized: false as const,
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

  trackByOrderNumberAndEmail(orderNumber: string, email: string) {
    return orderRepository.findGuestOrderForTrack(orderNumber, email)
  },

  attachGuestOrdersToUser(userId: string, email: string) {
    return orderRepository.attachGuestOrdersToUser(userId, email)
  },

  /**
   * CARD: create PENDING order + Stripe PaymentIntent; webhook finalizes MerchantOrders.
   * CASH_ON_DELIVERY: create order and immediately fan out MerchantOrders (payment still PENDING).
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
