import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@bharatmart/ui'
import { OrderService } from '@bharatmart/services'
import { getCurrentUser } from '@/auth'

export const dynamic = 'force-dynamic'

const timeline = ['Placed', 'Processing', 'Shipped', 'Delivered'] as const

function activeStep(status: string) {
  switch (status) {
    case 'DELIVERED':
      return 3
    case 'SHIPPED':
      return 2
    case 'CANCELLED':
      return 0
    case 'PROCESSING':
    default:
      return 1
  }
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/login?callbackUrl=/account/orders')

  const { id } = await params
  const order = await OrderService.getById(id)
  if (!order || order.customerId !== user.id) notFound()

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 md:px-8 lg:px-16">
      <Link className="text-sm font-medium text-[#7f5700] hover:underline" href="/account/orders">
        ← Back to orders
      </Link>
      <h1 className="mt-4 font-heading text-3xl font-semibold">{order.orderNumber}</h1>
      <p className="mt-1 text-sm text-[#514534]">
        Delivering to {order.address.line1}, {order.address.city} {order.address.postcode}
      </p>

      <div className="mt-8 space-y-4">
        {order.merchantOrders.map((merchantOrder) => {
          const step = activeStep(merchantOrder.status)
          return (
            <Card className="border-[#d6c4ad]" key={merchantOrder.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">{merchantOrder.merchant.storeName}</CardTitle>
                <Badge>{merchantOrder.status}</Badge>
              </CardHeader>
              <CardContent className="space-y-6">
                <ol className="grid gap-3 sm:grid-cols-4">
                  {timeline.map((label, index) => (
                    <li key={label}>
                      <div
                        className={`mb-2 h-2 rounded-full ${
                          index <= step ? 'bg-[#2e6a39]' : 'bg-[#eee7de]'
                        }`}
                      />
                      <p className={`text-sm ${index <= step ? 'font-semibold' : 'text-[#837561]'}`}>
                        {label}
                      </p>
                    </li>
                  ))}
                </ol>
                <ul className="space-y-2 text-sm">
                  {merchantOrder.orderItems.map((item) => (
                    <li className="flex justify-between gap-3" key={item.id}>
                      <span>
                        {item.productNameSnapshot} × {item.quantity}
                      </span>
                      <span>
                        £{((item.priceInPenceSnapshot * item.quantity) / 100).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </main>
  )
}
