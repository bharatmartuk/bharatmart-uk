import { ProductService } from '@bharatmart/services'
import { CartClient } from '@/components/cart/CartClient'
import { RelatedProducts } from '@/components/product/RelatedProducts'

export const dynamic = 'force-dynamic'

export default async function CartPage() {
  const recommendedProducts = await ProductService.getFeatured(8)

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-16">
      <CartClient />
      <RelatedProducts
        embedded
        products={recommendedProducts}
        subtitle="Popular picks you can add to your cart"
        title="Recommended for you"
      />
    </main>
  )
}
