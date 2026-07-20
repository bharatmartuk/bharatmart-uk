import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { ProductSummary } from '@bharatmart/services'
import { ProductCard } from '@/components/product/ProductCard'

export function TrendingProducts({ products }: { products: ProductSummary[] }) {
  if (products.length === 0) return null

  return (
    <section aria-labelledby="trending-heading" className="mx-auto max-w-7xl px-4 pb-12 pt-2 md:px-8 md:pb-14 md:pt-3 lg:px-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold md:text-3xl" id="trending-heading">
            Trending Products
          </h2>
          <p className="mt-1 text-sm text-[#514534] md:text-base">
            Handpicked favourites from trusted Indian merchants
          </p>
        </div>
        <Link className="flex items-center gap-1 text-sm font-semibold text-[#a83635] hover:underline" href="/products">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
