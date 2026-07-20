import Link from 'next/link'
import type { ProductSummary } from '@bharatmart/services'
import { ProductCard } from '@/components/product/ProductCard'

export function RelatedProducts({
  products,
  categoryName,
}: {
  products: ProductSummary[]
  categoryName?: string
}) {
  if (products.length === 0) return null

  return (
    <section aria-labelledby="related-heading" className="mx-auto max-w-7xl px-4 pb-12 pt-2 md:px-8 lg:px-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold md:text-3xl" id="related-heading">
            Other related products
          </h2>
          <p className="mt-1 text-sm text-[#514534]">
            {categoryName
              ? `More from ${categoryName}`
              : 'You may also like these picks from our merchants'}
          </p>
        </div>
        <Link className="shrink-0 text-sm font-semibold text-[#a83635] hover:underline" href="/products">
          View all
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
