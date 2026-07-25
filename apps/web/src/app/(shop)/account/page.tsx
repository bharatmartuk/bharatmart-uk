import { redirect } from 'next/navigation'
import { MapPin } from 'lucide-react'
import { AddressService, AuthService, OrderService } from '@bharatmart/services'
import { Card, CardContent, CardHeader, CardTitle } from '@bharatmart/ui'
import { AccountHero } from '@/components/account/AccountHero'
import { AccountNotificationPrefs } from '@/components/account/AccountNotificationPrefs'
import { AccountPersonalInfo } from '@/components/account/AccountPersonalInfo'
import { AccountQuickActions } from '@/components/account/AccountQuickActions'
import { AccountRecentOrders } from '@/components/account/AccountRecentOrders'
import { AccountSecurity } from '@/components/account/AccountSecurity'
import { AccountWishlistPreview } from '@/components/account/AccountWishlistPreview'
import { AddressBook } from '@/components/account/AddressBook'
import { getCurrentUser } from '@/auth'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?callbackUrl=/account')

  const [profile, addresses, orders] = await Promise.all([
    AuthService.getProfile(user.id),
    AddressService.getForUser(user.id),
    OrderService.getForCustomer(user.id),
  ])

  if (!profile) redirect('/login?callbackUrl=/account')

  const recentOrders = orders.slice(0, 3).map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    totalInPence: order.totalInPence,
    merchantOrders: order.merchantOrders.map((merchantOrder) => ({
      id: merchantOrder.id,
      status: merchantOrder.status,
      merchant: {
        storeName: merchantOrder.merchant.storeName,
        storeLogoUrl: null,
      },
    })),
  }))

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-16">
      <div className="space-y-8">
        <AccountHero
          emailVerified={Boolean(profile.emailVerified)}
          imageUrl={profile.image}
          name={profile.name || 'BharatMart customer'}
        />

        <AccountQuickActions />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <AccountPersonalInfo
            email={profile.email}
            emailVerified={Boolean(profile.emailVerified)}
            name={profile.name || 'BharatMart customer'}
            phone={profile.phone}
            role={profile.role}
          />
          <AccountSecurity hasPassword={Boolean(profile.passwordHash)} />
        </div>

        <AccountRecentOrders orders={recentOrders} />

        <Card
          className="scroll-mt-28 rounded-2xl border-[#e8d9c8] bg-white shadow-sm"
          id="saved-addresses"
        >
          <CardHeader className="p-6 pb-2">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-[#1e1b16]">
              <MapPin className="h-5 w-5 text-[#7f5700]" aria-hidden />
              Saved Addresses
            </CardTitle>
            <p className="mt-1 text-sm text-[#514534]">
              Delivery locations ready for checkout.
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-4">
            <AddressBook
              addresses={addresses.map((address) => ({
                id: address.id,
                label: address.label,
                line1: address.line1,
                line2: address.line2,
                city: address.city,
                postcode: address.postcode,
                isDefault: address.isDefault,
              }))}
            />
          </CardContent>
        </Card>

        <AccountWishlistPreview />

        <AccountNotificationPrefs />
      </div>
    </main>
  )
}
