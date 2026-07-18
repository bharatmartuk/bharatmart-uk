import { Badge, Card, CardContent } from '@bharatmart/ui'
import { AdminOrderService } from '@bharatmart/services'

export const dynamic = 'force-dynamic'

type SearchParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
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
          Cross-merchant read-only view via AdminOrderService.searchAllOrders().
        </p>
      </div>

      <form className="flex flex-wrap gap-3">
        <input
          className="rounded-md border border-[#d6c4ad] bg-white px-3 py-2 text-sm"
          defaultValue={first(params.q)}
          name="q"
          placeholder="Search order or merchant"
        />
        <select
          className="rounded-md border border-[#d6c4ad] bg-white px-3 py-2 text-sm"
          defaultValue={first(params.status) ?? ''}
          name="status"
        >
          <option value="">All statuses</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button className="rounded-md border border-[#d6c4ad] px-3 py-2 text-sm" type="submit">
          Search
        </button>
      </form>

      <div className="space-y-3">
        {result.items.map((order) => (
          <Card className="border-[#d6c4ad]" key={order.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
              <div>
                <p className="font-semibold">{order.order.orderNumber}</p>
                <p className="text-[#514534]">
                  {order.merchant.storeName} · {order.order.customer.name ?? order.order.customer.email}
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
