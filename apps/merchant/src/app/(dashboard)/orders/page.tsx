import Link from 'next/link'
import { Eye } from 'lucide-react'
import { Badge, Card, CardContent } from '@bharatmart/ui'
import { MerchantOrderService } from '@bharatmart/services'
import { requireMerchant } from '@/lib/merchant-context'
import { orderStatusLabel, type MerchantOrderStatus } from '@/lib/order-status'

export const dynamic = 'force-dynamic'

type SearchParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function MerchantOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { merchant } = await requireMerchant()
  const status = first(params.status) as MerchantOrderStatus | undefined

  const orders = await MerchantOrderService.getForMerchant(
    merchant.id,
    status,
  )

  return (
    <main className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Orders</h1>
        <p className="text-sm text-[#514534]">Manage fulfilment for your store only.</p>
      </div>

      <form className="flex gap-3">
        <select
          className="rounded-md border border-[#d6c4ad] bg-white px-3 py-2 text-sm"
          defaultValue={status ?? ''}
          name="status"
        >
          <option value="">All statuses</option>
          <option value="PLACED">Order placed</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button className="rounded-md border border-[#d6c4ad] px-3 py-2 text-sm" type="submit">
          Filter
        </button>
      </form>

      <div className="space-y-3">
        {orders.map((order) => (
          <Card className="border-[#d6c4ad]" key={order.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <Link className="font-semibold hover:text-[#7f5700]" href={`/orders/${order.id}`}>
                  {order.order.orderNumber}
                </Link>
                <p className="text-sm text-[#514534]">
                  {order.order.customer?.name ??
                    order.order.customer?.email ??
                    ([order.order.guestFirstName, order.order.guestLastName]
                      .filter(Boolean)
                      .join(' ') ||
                      order.order.guestEmail ||
                      'Guest')}{' '}
                  · {order.orderItems.length} items · £{(order.subtotalInPence / 100).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge>{orderStatusLabel(order.status)}</Badge>
                <Link
                  aria-label={`View order ${order.order.orderNumber}`}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d6c4ad] bg-white text-[#514534] transition hover:border-[#7f5700] hover:bg-[#f4ede4] hover:text-[#7f5700]"
                  href={`/orders/${order.id}`}
                  title="View order details"
                >
                  <Eye aria-hidden className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
