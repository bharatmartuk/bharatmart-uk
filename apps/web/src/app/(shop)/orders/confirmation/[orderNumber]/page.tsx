import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@bharatmart/ui'
import { OrderService } from '@bharatmart/services'
import { ORDER_STATUS_STYLES, orderStatusLabel } from '@/lib/order-status'

export const dynamic = 'force-dynamic'

const priceFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'full',
  timeStyle: 'short',
})

export default async function GuestOrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>
  searchParams: Promise<{ placed?: string }>
}) {
  const { orderNumber: raw } = await params
  const { placed } = await searchParams
  const orderNumber = decodeURIComponent(raw)
  const order = await OrderService.getByOrderNumberWithPaymentSync(orderNumber)
  if (!order) notFound()

  const guestName = [order.guestFirstName, order.guestLastName].filter(Boolean).join(' ')
  const emailForRegister = order.guestEmail ?? order.customer?.email ?? ''
  const registerHref = emailForRegister
    ? `/register?email=${encodeURIComponent(emailForRegister)}&callbackUrl=${encodeURIComponent('/account/orders')}`
    : '/register?callbackUrl=/account/orders'

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 md:px-8 lg:px-16">
      <h1 className="font-heading text-3xl font-semibold">
        {placed === '1' ? 'Thank you for your order' : 'Order confirmation'}
      </h1>
      <p className="mt-2 text-sm text-[#514534]">
        {guestName ? `Hi ${guestName} — ` : null}
        Your order <strong>{order.orderNumber}</strong> was placed on{' '}
        {dateFormatter.format(order.placedAt)}.
      </p>

      <Card className="mt-8 border-[#d6c4ad]">
        <CardHeader className="flex flex-row items-start justify-between gap-3">
          <CardTitle>Order summary</CardTitle>
          <Badge>{order.paymentStatus}</Badge>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-[#a83635]">
              {priceFormatter.format(order.totalInPence / 100)}
            </span>
          </div>
          <p className="text-[#514534]">
            Delivering to {order.address.line1}
            {order.address.line2 ? `, ${order.address.line2}` : ''}, {order.address.city}
            {order.address.county ? `, ${order.address.county}` : ''} {order.address.postcode}
          </p>

          {order.merchantOrders.length === 0 ? (
            <p className="rounded-lg bg-[#f9f3ea] px-3 py-2 text-[#514534]">
              Merchants will start preparing once payment is confirmed
              {order.paymentMethod === 'CASH_ON_DELIVERY' ? ' on delivery setup' : ''}.
            </p>
          ) : (
            <ul className="space-y-3">
              {order.merchantOrders.map((mo) => (
                <li className="rounded-xl border border-[#d6c4ad] p-4" key={mo.id}>
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="font-semibold">{mo.merchant.storeName}</span>
                    <Badge className={ORDER_STATUS_STYLES[mo.status] ?? ''}>
                      {orderStatusLabel(mo.status)}
                    </Badge>
                  </div>
                  {mo.orderItems.map((item) => (
                    <div className="flex justify-between gap-3" key={item.id}>
                      <span>
                        {item.productNameSnapshot} × {item.quantity}
                      </span>
                      <span>
                        {priceFormatter.format(
                          (item.priceInPenceSnapshot * item.quantity) / 100,
                        )}
                      </span>
                    </div>
                  ))}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild className="bg-[#7f5700] text-white hover:bg-[#604100]">
          <Link href="/orders/track">Track this order</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={registerHref}>Create an account</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/products">Continue shopping</Link>
        </Button>
      </div>

      <p className="mt-4 text-xs text-[#837561]">
        Save your order number and the email used at checkout to track delivery anytime.
      </p>
    </main>
  )
}
