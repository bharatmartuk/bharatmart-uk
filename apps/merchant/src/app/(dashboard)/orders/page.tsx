import Link from 'next/link'
import { Badge, Card, CardContent } from '@bharatmart/ui'
import { MerchantOrderService } from '@bharatmart/services'
import { requireMerchant } from '@/lib/merchant-context'

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
  const status = first(params.status) as
    | 'PROCESSING'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED'
    | undefined

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
              <Badge>{order.status}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
