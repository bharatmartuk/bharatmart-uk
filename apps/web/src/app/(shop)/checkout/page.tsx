import { AddressService } from '@bharatmart/services'
import { getCurrentUser } from '@/auth'
import { CheckoutClient } from '@/components/checkout/CheckoutClient'

export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
  const user = await getCurrentUser()
  const addresses = user ? await AddressService.getForUser(user.id) : []

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-16">
      <h1 className="mb-6 font-heading text-3xl font-semibold">Checkout</h1>
      <CheckoutClient
        addresses={addresses.map((address) => ({
          id: address.id,
          label: address.label,
          line1: address.line1,
          line2: address.line2,
          city: address.city,
          postcode: address.postcode,
          isDefault: address.isDefault,
        }))}
        isAuthenticated={Boolean(user)}
      />
    </main>
  )
}
