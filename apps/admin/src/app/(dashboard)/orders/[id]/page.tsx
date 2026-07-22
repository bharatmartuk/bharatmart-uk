import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge, Card, CardContent, CardHeader, CardTitle, Separator } from '@bharatmart/ui'
import { AdminOrderService } from '@bharatmart/services'

export const dynamic = 'force-dynamic'

const priceFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'full',
  timeStyle: 'short',
})

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const order = await AdminOrderService.getById(id)
  if (!order) notFound()

  const customer = order.order.customer
  const address = order.order.address
  const itemTotal = order.orderItems.reduce(
    (sum, item) => sum + item.priceInPenceSnapshot * item.quantity,
    0,
  )

  return (
    <main className="space-y-6">
      <div>
        <Link className="text-sm font-medium text-[#7f5700] hover:underline" href="/orders">
          ← Back to orders
        </Link>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">{order.order.orderNumber}</h1>
            <p className="mt-1 text-sm text-[#514534]">
              Placed {dateFormatter.format(order.order.placedAt)}
            </p>
          </div>
          <Badge className="text-sm">{order.status}</Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-[#d6c4ad]">
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-[#837561]">Name: </span>
              <span className="font-medium">{customer.name?.trim() || '-'}</span>
            </p>
            <p>
              <span className="text-[#837561]">Email: </span>
              {customer.email ? (
                <a className="font-medium text-[#7f5700] hover:underline" href={`mailto:${customer.email}`}>
                  {customer.email}
                </a>
              ) : (
                '-'
              )}
            </p>
            <p>
              <span className="text-[#837561]">Phone: </span>
              <span className="font-medium">{customer.phone ?? '-'}</span>
            </p>
            <p>
              <span className="text-[#837561]">Customer ID: </span>
              <span className="font-mono text-xs">{customer.id}</span>
            </p>
          </CardContent>
        </Card>

        <Card className="border-[#d6c4ad]">
          <CardHeader>
            <CardTitle>Delivery address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p className="font-medium">{address.label}</p>
            <p>{address.line1}</p>
            {address.line2 ? <p>{address.line2}</p> : null}
            <p>
              {address.city} {address.postcode}
            </p>
            <p>{address.country}</p>
          </CardContent>
        </Card>

        <Card className="border-[#d6c4ad]">
          <CardHeader>
            <CardTitle>Merchant fulfilment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-[#837561]">Store: </span>
              <span className="font-medium">{order.merchant.storeName}</span>
            </p>
            <p>
              <span className="text-[#837561]">Business: </span>
              <span className="font-medium">{order.merchant.businessName}</span>
            </p>
            <p>
              <span className="text-[#837561]">Status: </span>
              <Badge variant="secondary">{order.status}</Badge>
            </p>
            {order.courierName || order.trackingNumber ? (
              <>
                <p>
                  <span className="text-[#837561]">Courier: </span>
                  {order.courierName ?? '-'}
                </p>
                <p>
                  <span className="text-[#837561]">Tracking: </span>
                  {order.trackingNumber ?? '-'}
                </p>
              </>
            ) : null}
            {order.shippedAt ? (
              <p>
                <span className="text-[#837561]">Shipped: </span>
                {dateFormatter.format(order.shippedAt)}
              </p>
            ) : null}
            {order.deliveredAt ? (
              <p>
                <span className="text-[#837561]">Delivered: </span>
                {dateFormatter.format(order.deliveredAt)}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-[#d6c4ad]">
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="text-[#837561]">Method: </span>
              <span className="font-medium">{order.order.paymentMethod}</span>
            </p>
            <p>
              <span className="text-[#837561]">Status: </span>
              <Badge variant="secondary">{order.order.paymentStatus}</Badge>
            </p>
            <p>
              <span className="text-[#837561]">Order total: </span>
              <span className="font-medium">
                {priceFormatter.format(order.order.totalInPence / 100)}
              </span>
            </p>
            <p>
              <span className="text-[#837561]">Delivery fee: </span>
              {priceFormatter.format(order.order.deliveryFeeInPence / 100)}
            </p>
            <p>
              <span className="text-[#837561]">Discount: </span>
              {priceFormatter.format(order.order.discountInPence / 100)}
            </p>
            {order.order.stripePaymentIntentId ? (
              <p>
                <span className="text-[#837561]">Stripe PI: </span>
                <span className="font-mono text-xs">{order.order.stripePaymentIntentId}</span>
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Card className="border-[#d6c4ad]">
        <CardHeader>
          <CardTitle>Order items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {order.orderItems.map((item) => (
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#eee7de] pb-3 last:border-0 last:pb-0" key={item.id}>
              <div>
                <p className="font-medium">{item.productNameSnapshot}</p>
                <p className="text-[#837561]">
                  Qty {item.quantity} · {priceFormatter.format(item.priceInPenceSnapshot / 100)} each
                  {item.product.sku ? ` · SKU ${item.product.sku}` : ''}
                </p>
              </div>
              <p className="font-semibold">
                {priceFormatter.format((item.priceInPenceSnapshot * item.quantity) / 100)}
              </p>
            </div>
          ))}
          <Separator className="bg-[#d6c4ad]" />
          <div className="flex justify-between font-semibold">
            <span>Merchant subtotal</span>
            <span>{priceFormatter.format(order.subtotalInPence / 100)}</span>
          </div>
          {itemTotal !== order.subtotalInPence ? (
            <p className="text-xs text-[#837561]">
              Line items total {priceFormatter.format(itemTotal / 100)}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </main>
  )
}
