import 'server-only'

import { addressRepository } from '../repositories/address.repository'
import {
  orderRepository,
  type PlaceOrderInput,
} from '../repositories/order.repository'
import { NotFoundError, ValidationError } from '../errors'
import { NotificationService } from './notification.service'
import { PaymentService } from './payment.service'

async function notifyOrderParties(order: {
  id: string
  merchantOrders: Array<{ merchantId: string }>
}) {
  await NotificationService.sendOrderConfirmation(order.id)
  for (const merchantOrder of order.merchantOrders) {
    await NotificationService.notifyMerchantNewOrder(merchantOrder.merchantId, order.id)
  }
}

export const OrderService = {
  getForCustomer(userId: string) {
    return orderRepository.findForCustomer(userId)
  },

  getById(orderId: string) {
    return orderRepository.findById(orderId)
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

    const paymentMethod = input.paymentMethod ?? 'CARD'

    try {
      const pending = await orderRepository.createPendingOrder({
        ...input,
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
        customerId: input.customerId,
        orderId: pending.id,
        orderNumber: pending.orderNumber,
      })

      const order = await orderRepository.attachPaymentIntent(pending.id, paymentIntent.id)
      return {
        ...order,
        clientSecret: paymentIntent.client_secret,
        finalized: false as const,
      }
    } catch (error) {
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
