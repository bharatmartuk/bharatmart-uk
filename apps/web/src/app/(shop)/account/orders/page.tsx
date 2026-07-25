import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@bharatmart/ui'
import { OrderService } from '@bharatmart/services'
import { UserRole } from '@bharatmart/types'
import { getCurrentUser } from '@/auth'
import { ORDER_STATUS_STYLES, orderStatusLabel } from '@/lib/order-status'

export const dynamic = 'force-dynamic'

const priceFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

export default async function OrdersPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?callbackUrl=/account/orders')
  if (user.role !== UserRole.CUSTOMER && user.role !== UserRole.ADMIN) {
    redirect('/login?callbackUrl=/account/orders')
  }

  const orders = await OrderService.getForCustomer(user.id)

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-8 lg:px-16">
      <h1 className="font-heading text-3xl font-semibold">Your orders</h1>
      <p className="mt-1 text-sm text-[#514534]">Track deliveries across every merchant in each checkout.</p>

      {orders.length === 0 ? (
        <Card className="mt-8 border-dashed border-[#d6c4ad]">
          <CardContent className="space-y-4 p-8 text-center">
            <p>No orders yet.</p>
            <Button asChild className="bg-[#7f5700] text-white hover:bg-[#604100]">
              <Link href="/products">Start shopping</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <Card className="border-[#d6c4ad]" key={order.id}>
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div>
                  <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                  <p className="mt-1 text-sm text-[#837561]">
                    Placed {order.placedAt.toLocaleDateString('en-GB')} ·{' '}
                    {priceFormatter.format(order.totalInPence / 100)}
                  </p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/account/orders/${order.id}`}>Track order</Link>
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.merchantOrders.length === 0 ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#f9f3ea] px-3 py-2">
                    <p className="text-sm text-[#514534]">
                      Awaiting payment confirmation — open the order to see the latest.
                    </p>
                    <Badge className={ORDER_STATUS_STYLES.PLACED}>Order placed</Badge>
                  </div>
                ) : null}
                {order.merchantOrders.map((merchantOrder) => (
                  <div
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#f9f3ea] px-3 py-2"
                    key={merchantOrder.id}
                  >
                    <div>
                      <p className="font-medium">{merchantOrder.merchant.storeName}</p>
                      <p className="text-xs text-[#837561]">
                        {merchantOrder.orderItems.length} item
                        {merchantOrder.orderItems.length === 1 ? '' : 's'} ·{' '}
                        {priceFormatter.format(merchantOrder.subtotalInPence / 100)}
                      </p>
                    </div>
                    <Badge className={ORDER_STATUS_STYLES[merchantOrder.status] ?? ''}>
                      {orderStatusLabel(merchantOrder.status)}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  )
}
