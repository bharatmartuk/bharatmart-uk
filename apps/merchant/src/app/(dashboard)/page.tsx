import Link from 'next/link'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@bharatmart/ui'
import { MerchantOrderService, ProductService } from '@bharatmart/services'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { requireMerchant } from '@/lib/merchant-context'

export const dynamic = 'force-dynamic'

const priceFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

export default async function MerchantDashboardPage() {
  const { merchant } = await requireMerchant()
  const [stats, chart, pending, lowStock] = await Promise.all([
    MerchantOrderService.getTodayStats(merchant.id),
    MerchantOrderService.getRevenueChartData(merchant.id, 14),
    MerchantOrderService.getPendingOrders(merchant.id),
    ProductService.getLowStock(merchant.id, 5),
  ])

  return (
    <main className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Dashboard</h1>
        <p className="text-sm text-[#514534]">Welcome back, {merchant.storeName}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-[#d6c4ad]">
          <CardHeader>
            <CardTitle className="text-sm text-[#837561]">Orders today</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{stats.ordersToday}</CardContent>
        </Card>
        <Card className="border-[#d6c4ad]">
          <CardHeader>
            <CardTitle className="text-sm text-[#837561]">Revenue today</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {priceFormatter.format(stats.revenueTodayInPence / 100)}
          </CardContent>
        </Card>
        <Card className="border-[#d6c4ad]">
          <CardHeader>
            <CardTitle className="text-sm text-[#837561]">Pending orders</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">{stats.pendingOrders}</CardContent>
        </Card>
      </div>

      <Card className="border-[#d6c4ad]">
        <CardHeader>
          <CardTitle>Revenue (14 days)</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={chart} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-[#d6c4ad]">
          <CardHeader>
            <CardTitle>Pending orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pending.length === 0 ? (
              <p className="text-sm text-[#514534]">No pending orders.</p>
            ) : (
              pending.map((order) => (
                <Link
                  className="flex items-center justify-between rounded-lg bg-[#f9f3ea] px-3 py-2 text-sm hover:bg-[#eee7de]"
                  href={`/orders/${order.id}`}
                  key={order.id}
                >
                  <span>{order.order.orderNumber}</span>
                  <Badge>{order.status}</Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-[#d6c4ad]">
          <CardHeader>
            <CardTitle>Low stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStock.length === 0 ? (
              <p className="text-sm text-[#514534]">Inventory looks healthy.</p>
            ) : (
              lowStock.map((product) => (
                <div className="flex justify-between text-sm" key={product.id}>
                  <span>{product.name}</span>
                  <span className="font-semibold text-[#a83635]">{product.stockQuantity} left</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
