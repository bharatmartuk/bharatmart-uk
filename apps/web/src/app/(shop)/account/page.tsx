import Link from 'next/link'
import { redirect } from 'next/navigation'
import { MapPin, Package, UserCircle } from 'lucide-react'
import { AddressService, AuthService } from '@bharatmart/services'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@bharatmart/ui'
import { AccountSignOutButton } from '@/components/account/AccountSignOutButton'
import { AddressBook } from '@/components/account/AddressBook'
import { getCurrentUser } from '@/auth'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?callbackUrl=/account')

  const [profile, addresses] = await Promise.all([
    AuthService.getProfile(user.id),
    AddressService.getForUser(user.id),
  ])

  if (!profile) redirect('/login?callbackUrl=/account')

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-8 lg:px-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#efe2cf]">
            <UserCircle className="h-8 w-8 text-[#7f5700]" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-semibold">Your account</h1>
            <p className="mt-1 text-sm text-[#514534]">
              Manage your profile, orders, and delivery addresses.
            </p>
          </div>
        </div>
        <AccountSignOutButton />
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <Card className="border-[#d6c4ad]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCircle className="h-5 w-5 text-[#7f5700]" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-[#837561]">Name</p>
              <p className="font-medium">{profile.name || 'BharatMart customer'}</p>
            </div>
            <div>
              <p className="text-[#837561]">Email</p>
              <p className="font-medium">{profile.email}</p>
            </div>
            {profile.phone ? (
              <div>
                <p className="text-[#837561]">Phone</p>
                <p className="font-medium">{profile.phone}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-[#d6c4ad]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-[#7f5700]" />
              Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[#514534]">
              View your purchases and track each merchant delivery.
            </p>
            <Button asChild className="bg-[#7f5700] text-white hover:bg-[#604100]">
              <Link href="/account/orders">View order history</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-[#d6c4ad] md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MapPin className="h-5 w-5 text-[#7f5700]" />
              Delivery addresses
            </CardTitle>
          </CardHeader>
          <CardContent>
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
      </div>
    </main>
  )
}
