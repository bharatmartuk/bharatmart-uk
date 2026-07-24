import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@bharatmart/ui'
import { MerchantOrderService } from '@bharatmart/services'
import { OrderStatusForm } from '@/components/orders/OrderStatusForm'
import { requireMerchant } from '@/lib/merchant-context'

export const dynamic = 'force-dynamic'

export default async function MerchantOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { merchant } = await requireMerchant()
  const { id } = await params
  const order = await MerchantOrderService.getByIdForMerchant(id, merchant.id)
  if (!order) notFound()

  return (
    <main className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">{order.order.orderNumber}</h1>
        <p className="text-sm text-[#514534]">
          {order.order.customer?.name ??
            order.order.customer?.email ??
            ([order.order.guestFirstName, order.order.guestLastName].filter(Boolean).join(' ') ||
              order.order.guestEmail ||
              'Guest')}{' '}
          · {order.order.address.line1}, {order.order.address.city} {order.order.address.postcode}
        </p>
      </div>

      <Card className="border-[#d6c4ad]">
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {order.orderItems.map((item) => (
            <div className="flex justify-between gap-3" key={item.id}>
              <span>
                {item.productNameSnapshot} × {item.quantity}
              </span>
              <span>£{((item.priceInPenceSnapshot * item.quantity) / 100).toFixed(2)}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <OrderStatusForm currentStatus={order.status} merchantOrderId={order.id} />
    </main>
  )
}
