import Link from 'next/link'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@bharatmart/ui'
import { MerchantService } from '@bharatmart/services'

export const dynamic = 'force-dynamic'

export default async function MerchantsPage() {
  const [pending, approved] = await Promise.all([
    MerchantService.getPendingVerifications(),
    MerchantService.getFilterOptions(),
  ])

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Merchants</h1>
        <p className="text-sm text-[#514534]">Review seller applications and approved stores.</p>
      </div>

      <Card className="border-[#d6c4ad]">
        <CardHeader>
          <CardTitle>Pending verification ({pending.length})</CardTitle>
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

      <Card className="border-[#d6c4ad]">
        <CardHeader>
          <CardTitle>Approved stores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {approved.length === 0 ? (
            <p className="text-sm text-[#514534]">No approved merchants yet.</p>
          ) : (
            approved.map((merchant) => (
              <Link
                className="block rounded-lg px-3 py-2 text-sm text-[#514534] hover:bg-[#f4ede4]"
                href={`/merchants/${merchant.id}`}
                key={merchant.id}
              >
                {merchant.storeName}{' '}
                <span className="text-[#837561]">/{merchant.storeSlug}</span>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </main>
  )
}
