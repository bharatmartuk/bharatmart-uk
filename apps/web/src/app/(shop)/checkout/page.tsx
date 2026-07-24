import { AddressService, ProductService } from '@bharatmart/services'
import { getCurrentUser } from '@/auth'
import { CheckoutClient } from '@/components/checkout/CheckoutClient'
import { RelatedProducts } from '@/components/product/RelatedProducts'

export const dynamic = 'force-dynamic'

export default async function CheckoutPage() {
  const user = await getCurrentUser()
  const [addresses, recommendedProducts] = await Promise.all([
    user ? AddressService.getForUser(user.id) : Promise.resolve([]),
    ProductService.getFeatured(8),
  ])

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
      <RelatedProducts
        embedded
        products={recommendedProducts}
        subtitle="Popular picks you can add before you place your order"
        title="Recommended for you"
      />
    </main>
  )
}
