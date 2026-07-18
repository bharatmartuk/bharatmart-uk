import { NextResponse } from 'next/server'
import { OrderService, PaymentService } from '@bharatmart/services'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  const rawBody = await request.text()

  try {
    const event = PaymentService.constructWebhookEvent(rawBody, signature)

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object
      await OrderService.finalizeFromPaymentIntent(paymentIntent.id)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Webhook error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
