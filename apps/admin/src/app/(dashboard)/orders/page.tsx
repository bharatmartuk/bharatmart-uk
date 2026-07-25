import Link from 'next/link'
import { Badge, Card, CardContent } from '@bharatmart/ui'
import { AdminOrderService } from '@bharatmart/services'

export const dynamic = 'force-dynamic'

type SearchParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

const priceFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const statusLabels: Record<string, string> = {
  PLACED: 'Order placed',
  PROCESSING: 'Processing',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const result = await AdminOrderService.searchAllOrders({
    q: first(params.q),
    status: first(params.status) as
      | 'PLACED'
      | 'PROCESSING'
      | 'SHIPPED'
      | 'DELIVERED'
      | 'CANCELLED'
      | undefined,
  })

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Order monitoring</h1>
        <p className="text-sm text-[#514534]">
          Platform-wide orders with customer, delivery, and merchant details.
        </p>
      </div>

      <form className="flex flex-wrap gap-3">
        <input
          className="rounded-md border border-[#d6c4ad] bg-white px-3 py-2 text-sm"
          defaultValue={first(params.q)}
          name="q"
          placeholder="Search order, customer, or merchant"
        />
        <select
          className="rounded-md border border-[#d6c4ad] bg-white px-3 py-2 text-sm"
          defaultValue={first(params.status) ?? ''}
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
          Search
        </button>
      </form>

      {result.items.length === 0 ? (
        <Card className="border-[#d6c4ad]">
          <CardContent className="p-6 text-sm text-[#514534]">No orders found.</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {result.items.map((order) => {
            const guestName = [order.order.guestFirstName, order.order.guestLastName]
              .filter(Boolean)
              .join(' ')
              .trim()
            const customerName =
              order.order.customer?.name?.trim() || guestName || 'Guest customer'
            const customerEmail =
              order.order.customer?.email ?? order.order.guestEmail ?? '-'
            const customerPhone = order.order.customer?.phone ?? order.order.guestPhone
            return (
              <Card className="border-[#d6c4ad]" key={order.id}>
                <CardContent className="flex flex-wrap items-start justify-between gap-4 p-4 text-sm">
                  <div className="min-w-0 space-y-1">
                    <Link
                      className="font-semibold text-[#1e1b16] hover:text-[#7f5700]"
                      href={`/orders/${order.id}`}
                    >
                      {order.order.orderNumber}
                    </Link>
                    <p className="text-[#514534]">
                      <span className="font-medium text-[#1e1b16]">{customerName}</span>
                      {' · '}
                      {customerEmail}
                      {customerPhone ? ` · ${customerPhone}` : ''}
                      {!order.order.customer ? ' · Guest' : ''}
                    </p>
                    <p className="text-[#837561]">
                      Merchant: {order.merchant.storeName} · {order.orderItems.length} item
                      {order.orderItems.length === 1 ? '' : 's'} ·{' '}
                      {priceFormatter.format(order.subtotalInPence / 100)}
                    </p>
                    <p className="text-[#837561]">
                      Placed {dateFormatter.format(order.order.placedAt)} · Payment{' '}
                      {order.order.paymentStatus}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge>{statusLabels[order.status] ?? order.status}</Badge>
                    <Link
                      className="text-xs font-semibold text-[#7f5700] hover:underline"
                      href={`/orders/${order.id}`}
                    >
                      View details
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </main>
  )
}
