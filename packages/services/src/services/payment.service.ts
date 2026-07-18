import 'server-only'

import Stripe from 'stripe'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured.')
  }
  return new Stripe(key)
}

export const PaymentService = {
  async createPaymentIntent(input: {
    amountInPence: number
    customerId: string
    orderId: string
    orderNumber: string
  }) {
    const stripe = getStripe()
    return stripe.paymentIntents.create({
      amount: input.amountInPence,
      currency: 'gbp',
      metadata: {
        customerId: input.customerId,
        orderId: input.orderId,
        orderNumber: input.orderNumber,
      },
      automatic_payment_methods: { enabled: true },
    })
  },

  constructWebhookEvent(rawBody: string, signature: string) {
    const stripe = getStripe()
    const secret = process.env.STRIPE_WEBHOOK_SECRET
    if (!secret) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not configured.')
    }
    return stripe.webhooks.constructEvent(rawBody, signature, secret)
  },
}

export const paymentService = PaymentService
