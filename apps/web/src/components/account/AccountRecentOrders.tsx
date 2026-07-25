import Link from 'next/link'
import { Package } from 'lucide-react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@bharatmart/ui'
import { MerchantLogo } from '@/components/merchant/MerchantLogo'
import { ORDER_STATUS_STYLES, orderStatusLabel } from '@/lib/order-status'

const priceFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

export type AccountRecentOrder = {
  id: string
  orderNumber: string
  totalInPence: number
  merchantOrders: Array<{
    id: string
    status: string
    merchant: {
      storeName: string
      storeLogoUrl?: string | null
    }
  }>
}

export function AccountRecentOrders({ orders }: { orders: AccountRecentOrder[] }) {
  return (
    <Card className="scroll-mt-28 rounded-2xl border-[#e8d9c8] bg-white shadow-sm" id="recent-orders">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-6 pb-2">
        <div>
          <CardTitle className="text-xl font-semibold text-[#1e1b16]">Recent Orders</CardTitle>
          <p className="mt-1 text-sm text-[#514534]">Your latest purchases across merchants.</p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/account/orders">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 p-6 pt-4">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e8d9c8] bg-[#f9f3ea]/60 px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#7f5700] shadow-sm">
              <Package className="h-6 w-6" aria-hidden />
            </div>
            <p className="mt-4 text-lg font-semibold text-[#1e1b16]">No orders yet</p>
            <p className="mt-1 max-w-sm text-sm text-[#514534]">
              When you place an order, tracking details will appear here.
            </p>
            <Button asChild className="mt-5 bg-[#7f5700] text-white hover:bg-[#604100]">
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          orders.map((order) => {
            const primaryMerchant = order.merchantOrders[0]?.merchant
            const status = order.merchantOrders[0]?.status ?? 'PLACED'
            const merchantName = primaryMerchant?.storeName ?? 'BharatMart order'

            return (
              <div
                className="flex flex-col gap-4 rounded-2xl border border-[#f0e6d8] bg-[#fdfaf6] p-4 transition-all duration-200 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                key={order.id}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <MerchantLogo
                    className="h-12 w-12 border"
                    sizes="48px"
                    storeLogoUrl={primaryMerchant?.storeLogoUrl ?? null}
                    storeName={merchantName}
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#1e1b16]">{merchantName}</p>
                    <p className="mt-0.5 text-sm text-[#837561]">{order.orderNumber}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 sm:justify-end">
                  <Badge className={ORDER_STATUS_STYLES[status] ?? ''}>
                    {orderStatusLabel(status)}
                  </Badge>
                  <p className="text-sm font-semibold text-[#a83635]">
                    {priceFormatter.format(order.totalInPence / 100)}
                  </p>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/account/orders/${order.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
