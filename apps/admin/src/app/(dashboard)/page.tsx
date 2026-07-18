import Link from 'next/link'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@bharatmart/ui'
import { AdminService, MerchantService } from '@bharatmart/services'

export const dynamic = 'force-dynamic'

const priceFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

export default async function AdminDashboardPage() {
  const [stats, pending] = await Promise.all([
    AdminService.getOverviewStats(),
    MerchantService.getPendingVerifications(),
  ])

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Operations dashboard</h1>
        <p className="text-sm text-[#514534]">Platform-wide health and verification queue.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ['Merchants', String(stats.totalMerchants)],
          ['Pending verification', String(stats.pendingVerificationCount)],
          ['Customers', String(stats.totalCustomers)],
          ['Platform GMV', priceFormatter.format(stats.platformGMV / 100)],
          ['Open tickets', String(stats.openTicketCount)],
        ].map(([label, value]) => (
          <Card className="border-[#d6c4ad]" key={label}>
            <CardHeader>
              <CardTitle className="text-sm text-[#837561]">{label}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{value}</CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-[#d6c4ad]">
        <CardHeader>
          <CardTitle>Verification queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pending.length === 0 ? (
            <p className="text-sm text-[#514534]">No merchants awaiting review.</p>
          ) : (
            pending.map((merchant) => (
              <Link
                className="flex items-center justify-between rounded-lg bg-[#f9f3ea] px-3 py-2 text-sm hover:bg-[#eee7de]"
                href={`/merchants/${merchant.id}`}
                key={merchant.id}
              >
                <span>
                  {merchant.storeName} · {merchant.user.email}
                </span>
                <Badge>{merchant.verificationStatus}</Badge>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </main>
  )
}
