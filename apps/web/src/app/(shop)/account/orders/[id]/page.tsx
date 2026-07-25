import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@bharatmart/ui'
import { OrderService } from '@bharatmart/services'
import { getCurrentUser } from '@/auth'
import { ORDER_STATUS_STYLES, orderStatusLabel, orderTimelineStep } from '@/lib/order-status'

export const dynamic = 'force-dynamic'

const timeline = ['Order placed', 'Processing', 'Shipped', 'Delivered'] as const

const priceFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

function Timeline({ step }: { step: number }) {
  return (
    <ol className="grid gap-3 sm:grid-cols-4">
      {timeline.map((label, index) => (
        <li key={label}>
          <div
            className={`mb-2 h-2 rounded-full ${index <= step ? 'bg-[#2e6a39]' : 'bg-[#eee7de]'}`}
          />
          <p className={`text-sm ${index <= step ? 'font-semibold' : 'text-[#837561]'}`}>{label}</p>
        </li>
      ))}
    </ol>
  )
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login?callbackUrl=/account/orders')

  const { id } = await params
  const order = await OrderService.getByIdWithPaymentSync(id)
  if (!order || order.customerId !== user.id) notFound()

  const awaitingPayment = order.merchantOrders.length === 0

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:px-8 lg:px-16">
      <Link className="text-sm font-medium text-[#7f5700] hover:underline" href="/account/orders">
        ← Back to orders
      </Link>
      <h1 className="mt-4 font-heading text-3xl font-semibold">{order.orderNumber}</h1>
      <p className="mt-1 text-sm text-[#514534]">
        Delivering to {order.address.line1}, {order.address.city} {order.address.postcode}
      </p>
      <p className="mt-1 text-sm text-[#837561]">
        Placed {order.placedAt.toLocaleDateString('en-GB')} ·{' '}
        {priceFormatter.format(order.totalInPence / 100)} ·{' '}
        {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on delivery' : 'Card'}
      </p>

      <div className="mt-8 space-y-4">
        {awaitingPayment ? (
          <Card className="border-[#d6c4ad]">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Order placed</CardTitle>
              <Badge className={ORDER_STATUS_STYLES.PLACED}>Order placed</Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <Timeline step={0} />
              <p className="rounded-lg bg-[#f9f3ea] px-3 py-2 text-sm text-[#514534]">
                We have your order. Merchant fulfilment details appear here as soon as the payment
                is confirmed — this usually takes a few seconds. Refresh if it stays this way.
              </p>
            </CardContent>
          </Card>
        ) : (
          order.merchantOrders.map((merchantOrder) => (
            <Card className="border-[#d6c4ad]" key={merchantOrder.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{merchantOrder.merchant.storeName}</CardTitle>
                <Badge className={ORDER_STATUS_STYLES[merchantOrder.status] ?? ''}>
                  {orderStatusLabel(merchantOrder.status)}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-6">
                <Timeline step={orderTimelineStep(merchantOrder.status)} />
                {merchantOrder.trackingNumber ? (
                  <p className="text-sm text-[#514534]">
                    Tracking {merchantOrder.trackingNumber}
                    {merchantOrder.courierName ? ` · ${merchantOrder.courierName}` : ''}
                  </p>
                ) : null}
                <ul className="space-y-2 text-sm">
                  {merchantOrder.orderItems.map((item) => (
                    <li className="flex justify-between gap-3" key={item.id}>
                      <span>
                        {item.productNameSnapshot} × {item.quantity}
                      </span>
                      <span>
                        {priceFormatter.format((item.priceInPenceSnapshot * item.quantity) / 100)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  )
}
