import Link from 'next/link'
import {
  Activity,
  ArrowRight,
  BadgePoundSterling,
  Bell,
  CheckCircle2,
  Database,
  LayoutDashboard,
  LifeBuoy,
  Mail,
  Package,
  RefreshCw,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Store,
  Users,
} from 'lucide-react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@bharatmart/ui'
import { AdminOrderService, AdminService, MerchantService } from '@bharatmart/services'
import {
  VerificationQueueTable,
  type PendingMerchantRow,
} from '@/components/dashboard/VerificationQueueTable'

export const dynamic = 'force-dynamic'

const priceFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const dayFormatter = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

function customerLabel(order: {
  customer: { name: string | null; email: string | null } | null
  guestFirstName: string | null
  guestLastName: string | null
  guestEmail: string | null
}) {
  if (order.customer?.name) return order.customer.name
  if (order.customer?.email) return order.customer.email
  const guestName = [order.guestFirstName, order.guestLastName].filter(Boolean).join(' ')
  return guestName || order.guestEmail || 'Guest'
}

export default async function AdminDashboardPage() {
  const [stats, pending, recentOrdersResult] = await Promise.all([
    AdminService.getOverviewStats(),
    MerchantService.getPendingVerifications(),
    AdminOrderService.searchAllOrders({ pageSize: 6 }),
  ])

  const pendingRows: PendingMerchantRow[] = pending.map((merchant) => ({
    id: merchant.id,
    storeName: merchant.storeName,
    ownerName: merchant.user.name,
    email: merchant.user.email,
    submittedAt: dateFormatter.format(merchant.createdAt),
    verificationStatus: merchant.verificationStatus,
  }))

  const kpiCards = [
    {
      title: 'Merchants',
      value: String(stats.totalMerchants),
      comparison: 'Active marketplace sellers',
      icon: Store,
    },
    {
      title: 'Customers',
      value: String(stats.totalCustomers),
      comparison: 'Registered shoppers',
      icon: Users,
    },
    {
      title: 'Orders',
      value: String(recentOrdersResult.total),
      comparison: 'Platform merchant orders',
      icon: ShoppingCart,
    },
    {
      title: 'Pending Verification',
      value: String(stats.pendingVerificationCount),
      comparison: 'Awaiting admin review',
      icon: ShieldCheck,
    },
    {
      title: 'Platform Revenue',
      value: priceFormatter.format(stats.platformGMV / 100),
      comparison: 'Gross merchandise value',
      icon: BadgePoundSterling,
    },
    {
      title: 'Support Tickets',
      value: String(stats.openTicketCount),
      comparison: stats.openTicketCount === 0 ? 'Everything looks good.' : 'Open / in progress',
      icon: LifeBuoy,
    },
  ]

  const quickActions = [
    {
      title: 'Approve Merchants',
      description: 'Review pending seller applications.',
      href: '/merchants',
      icon: ShieldCheck,
    },
    {
      title: 'Manage Orders',
      description: 'Track fulfilment across stores.',
      href: '/orders',
      icon: Package,
    },
    {
      title: 'Marketplace Settings',
      description: 'Update banners and category layout.',
      href: '/marketplace',
      icon: Settings,
    },
    {
      title: 'Support Inbox',
      description: 'Respond to customer and merchant tickets.',
      href: '/support-tickets',
      icon: Mail,
    },
  ]

  const healthRows = [
    { service: 'API', status: 'Healthy' as const, icon: Activity },
    { service: 'Database', status: 'Healthy' as const, icon: Database },
    { service: 'Payments', status: 'Healthy' as const, icon: BadgePoundSterling },
    { service: 'Emails', status: 'Healthy' as const, icon: Mail },
    { service: 'Storage', status: 'Healthy' as const, icon: LayoutDashboard },
  ]

  const activity = [
    ...pending.slice(0, 3).map((merchant) => ({
      id: `merchant-${merchant.id}`,
      label: 'Merchant Registered',
      detail: merchant.storeName,
      at: merchant.createdAt,
    })),
    ...recentOrdersResult.items.slice(0, 3).map((item) => ({
      id: `order-${item.id}`,
      label: 'Order Placed',
      detail: item.order.orderNumber,
      at: item.order.placedAt ?? item.createdAt,
    })),
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 6)

  return (
    <main className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-[#1e1b16]">
            Operations Dashboard
          </h1>
          <p className="mt-1 text-sm text-[#514534]">
            Monitor merchants, customers, orders and platform health.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-lg border border-[#d6c4ad] bg-white px-3 py-2 text-sm text-[#514534]">
            {dayFormatter.format(new Date())}
          </div>
          <Button asChild className="border-[#d6c4ad]" variant="outline">
            <Link href="/">
              <RefreshCw className="mr-1.5 h-4 w-4" />
              Refresh
            </Link>
          </Button>
          <Button asChild className="border-[#d6c4ad]" variant="outline">
            <Link aria-label="Support notifications" href="/support-tickets">
              <Bell className="mr-1.5 h-4 w-4" />
              Notifications
            </Link>
          </Button>
          <div className="rounded-lg border border-[#d6c4ad] bg-white px-3 py-2 text-sm font-medium text-[#7f5700]">
            Admin
          </div>
        </div>
      </div>

      <section className="rounded-xl border border-[#e8d9c8] bg-gradient-to-r from-[#f9f3ea] to-[#fffaf4] p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xl font-semibold text-[#1e1b16]">Welcome back 👋</p>
            <p className="mt-1 text-sm text-[#514534]">
              Platform Status · Everything operating normally.
            </p>
            <p className="mt-3 text-sm text-[#514534]">
              Pending merchant verifications:{' '}
              <span className="font-semibold text-[#7f5700]">{stats.pendingVerificationCount}</span>
            </p>
          </div>
          <Button asChild className="bg-[#7f5700] text-white hover:bg-[#604100]">
            <Link href="/merchants">
              View Verification Queue
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {kpiCards.map((card) => {
          const Icon = card.icon
          return (
            <Card
              className="rounded-xl border-[#e8d9c8] bg-white shadow-sm transition-all duration-200 hover:shadow-md"
              key={card.title}
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 p-6 pb-2">
                <CardTitle className="text-sm font-medium text-[#837561]">{card.title}</CardTitle>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f9f3ea] text-[#7f5700]">
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1 p-6 pt-0">
                <p className="text-3xl font-semibold tracking-tight text-[#1e1b16]">{card.value}</p>
                <p className="text-sm text-[#514534]">{card.comparison}</p>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-[#1e1b16]">Quick Actions</h2>
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link
                className="group rounded-xl border border-[#e8d9c8] bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md"
                href={action.href}
                key={action.title}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f9f3ea] text-[#7f5700]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#837561] transition group-hover:translate-x-0.5 group-hover:text-[#7f5700]" />
                </div>
                <p className="mt-4 text-lg font-semibold text-[#1e1b16]">{action.title}</p>
                <p className="mt-1 text-sm text-[#514534]">{action.description}</p>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.7fr)_minmax(0,0.3fr)]">
        <Card className="rounded-xl border-[#e8d9c8] bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 p-6">
            <div>
              <CardTitle className="text-lg font-semibold">Merchant Verification Queue</CardTitle>
              <p className="mt-1 text-sm text-[#514534]">Pending Merchants</p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/merchants">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <VerificationQueueTable merchants={pendingRows} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-xl border-[#e8d9c8] bg-white shadow-sm">
            <CardHeader className="p-6 pb-3">
              <CardTitle className="text-lg font-semibold">Platform Health</CardTitle>
              <p className="text-sm text-[#514534]">System Status</p>
            </CardHeader>
            <CardContent className="space-y-2 p-6 pt-0">
              {healthRows.map((row) => {
                const Icon = row.icon
                return (
                  <div
                    className="flex items-center justify-between rounded-lg px-2 py-2 transition-colors duration-200 hover:bg-[#fdfaf6]"
                    key={row.service}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="h-4 w-4 text-[#837561]" />
                      <span className="text-sm font-medium text-[#1e1b16]">{row.service}</span>
                    </div>
                    <Badge className="gap-1 bg-[#e8f5eb] text-[#2e6a39]">
                      <CheckCircle2 className="h-3 w-3" />
                      {row.status}
                    </Badge>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          <Card className="rounded-xl border-[#e8d9c8] bg-white shadow-sm">
            <CardHeader className="p-6 pb-3">
              <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-6 pt-0">
              {activity.length === 0 ? (
                <p className="text-sm text-[#514534]">Everything looks good.</p>
              ) : (
                activity.map((item) => (
                  <div
                    className="rounded-lg border border-[#efe2cf] px-3 py-2.5 transition-colors duration-200 hover:bg-[#fdfaf6]"
                    key={item.id}
                  >
                    <p className="text-sm font-medium text-[#1e1b16]">{item.label}</p>
                    <p className="text-sm text-[#514534]">{item.detail}</p>
                    <p className="mt-1 text-xs text-[#837561]">{dateFormatter.format(item.at)}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card className="rounded-xl border-[#e8d9c8] bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6">
            <div>
              <CardTitle className="text-lg font-semibold">Latest Orders</CardTitle>
              <p className="mt-1 text-sm text-[#514534]">Recent platform orders</p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/orders">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {recentOrdersResult.items.length === 0 ? (
              <p className="text-sm text-[#514534]">No orders yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[#efe2cf]">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="bg-[#f9f3ea] text-xs uppercase tracking-wide text-[#837561]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Order</th>
                      <th className="px-4 py-3 font-medium">Merchant</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrdersResult.items.map((item) => (
                      <tr
                        className="border-t border-[#efe2cf] transition-colors duration-200 hover:bg-[#fdfaf6]"
                        key={item.id}
                      >
                        <td className="px-4 py-3 font-medium text-[#1e1b16]">
                          {item.order.orderNumber}
                        </td>
                        <td className="px-4 py-3 text-[#514534]">{item.merchant.storeName}</td>
                        <td className="px-4 py-3 text-[#514534]">{customerLabel(item.order)}</td>
                        <td className="px-4 py-3 text-[#514534]">
                          {priceFormatter.format(item.order.totalInPence / 100)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge>{item.status}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-xl border-[#e8d9c8] bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-6">
            <div>
              <CardTitle className="text-lg font-semibold">Recent Merchants</CardTitle>
              <p className="mt-1 text-sm text-[#514534]">Latest verification applicants</p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/merchants">View All</Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 p-6 pt-0">
            {pending.length === 0 ? (
              <div className="rounded-xl bg-[#f9f3ea] px-4 py-8 text-center text-sm text-[#514534]">
                No merchants waiting for approval.
              </div>
            ) : (
              pending.slice(0, 6).map((merchant) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-xl border border-[#efe2cf] px-3 py-3 transition-all duration-200 hover:shadow-sm"
                  key={merchant.id}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-[#1e1b16]">{merchant.storeName}</p>
                    <p className="text-xs text-[#837561]">
                      Joined {dateFormatter.format(merchant.createdAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge className="bg-[#ffdeae] text-[#5b3d00]">
                      {merchant.verificationStatus}
                    </Badge>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/merchants/${merchant.id}`}>View Details</Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
