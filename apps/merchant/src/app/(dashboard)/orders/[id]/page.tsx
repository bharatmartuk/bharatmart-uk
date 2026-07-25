import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  CalendarClock,
  ChevronRight,
  MapPin,
  Package,
  ShoppingBag,
  User,
  Wallet,
} from 'lucide-react'
import { Card, CardContent } from '@bharatmart/ui'
import { MerchantOrderService } from '@bharatmart/services'
import { OrderStatusForm } from '@/components/orders/OrderStatusForm'
import { requireMerchant } from '@/lib/merchant-context'
import { orderStatusBadge, orderStatusLabel } from '@/lib/order-status'
import { resolveMarketplaceAssetUrl } from '@/lib/resolve-asset-url'

export const dynamic = 'force-dynamic'

const priceFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export default async function MerchantOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { merchant } = await requireMerchant()
  const { id } = await params
  const order = await MerchantOrderService.getByIdForMerchant(id, merchant.id)
  if (!order) notFound()

  const customerName =
    order.order.customer?.name?.trim() ||
    [order.order.guestFirstName, order.order.guestLastName].filter(Boolean).join(' ').trim() ||
    order.order.customer?.email ||
    order.order.guestEmail ||
    'Guest customer'

  const address = order.order.address
  const deliveryLine = [address.line1, address.city, address.postcode].filter(Boolean).join(', ')
  const badge = orderStatusBadge(order.status)
  const itemCount = order.orderItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <main className="space-y-6">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[#837561]">
        <Link className="transition hover:text-[#7f5700]" href="/orders">
          Orders
        </Link>
        <ChevronRight aria-hidden className="h-3.5 w-3.5" />
        <span className="font-medium text-[#1e1b16]">{order.order.orderNumber}</span>
      </nav>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-[#1e1b16]">
              {order.order.orderNumber}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}
            >
              <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
              {orderStatusLabel(order.status)}
            </span>
          </div>
          <div className="mt-2 flex flex-col gap-1 text-sm text-[#514534] sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <span className="inline-flex items-center gap-1.5">
              <User aria-hidden className="h-4 w-4 text-[#837561]" />
              {customerName}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin aria-hidden className="h-4 w-4 text-[#837561]" />
              {deliveryLine}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[420px]">
          <Card className="border-[#d6c4ad] shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ede7ff] text-[#5b4bb7]">
                <CalendarClock aria-hidden className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#837561]">Order placed</p>
                <p className="truncate text-sm font-semibold text-[#1e1b16]">
                  {dateFormatter.format(order.order.placedAt)}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-[#d6c4ad] shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#d8f5d9] text-[#2e6a39]">
                <Wallet aria-hidden className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-[#837561]">Total amount</p>
                <p className="text-lg font-semibold text-[#1e1b16]">
                  {priceFormatter.format(order.subtotalInPence / 100)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="border-[#d6c4ad] shadow-sm">
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 text-base font-semibold text-[#1e1b16]">
              <ShoppingBag aria-hidden className="h-4 w-4 text-[#7f5700]" />
              Items
              <span className="rounded-full bg-[#f4ede4] px-2 py-0.5 text-xs font-medium text-[#514534]">
                {itemCount}
              </span>
            </h2>
          </div>
          <ul className="divide-y divide-[#eee7de]">
            {order.orderItems.map((item) => {
              const rawImage = item.product?.images?.[0]?.url
              const imageUrl = rawImage
                ? (resolveMarketplaceAssetUrl(rawImage) ?? rawImage)
                : null
              return (
                <li className="flex items-center gap-4 py-3 first:pt-0 last:pb-0" key={item.id}>
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-[#f4ede4] ring-1 ring-[#eee7de]">
                    {imageUrl ? (
                      <Image
                        alt=""
                        className="object-cover"
                        fill
                        sizes="64px"
                        src={imageUrl}
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[#837561]">
                        <Package aria-hidden className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[#1e1b16]">
                      {item.productNameSnapshot}
                    </p>
                    <p className="text-xs text-[#837561]">
                      SKU: {item.product?.sku?.trim() ? item.product.sku : '—'}
                    </p>
                  </div>
                  <span className="rounded-lg border border-[#d6c4ad] bg-white px-2.5 py-1 text-xs font-medium text-[#514534]">
                    × {item.quantity}
                  </span>
                  <span className="w-20 text-right font-semibold text-[#1e1b16]">
                    {priceFormatter.format((item.priceInPenceSnapshot * item.quantity) / 100)}
                  </span>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>

      <Card className="border-[#d6c4ad] shadow-sm">
        <CardContent className="p-5">
          <div className="mb-4">
            <h2 className="inline-flex items-center gap-2 text-base font-semibold text-[#1e1b16]">
              <Package aria-hidden className="h-4 w-4 text-[#7f5700]" />
              Update order status
            </h2>
            <p className="mt-1 text-sm text-[#837561]">
              Move the order forward and add tracking details for the customer.
            </p>
          </div>
          <OrderStatusForm
            currentStatus={order.status}
            initialCourierName={order.courierName ?? ''}
            initialTrackingNumber={order.trackingNumber ?? ''}
            merchantOrderId={order.id}
          />
        </CardContent>
      </Card>
    </main>
  )
}
