import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { ProductSummary } from '@bharatmart/services'
import { ProductCard } from '@/components/product/ProductCard'

type ProductSectionProps = {
  id: string
  title: string
  subtitle: string
  products: ProductSummary[]
  viewAllHref?: string
}

export function ProductSection({
  id,
  title,
  subtitle,
  products,
  viewAllHref = '/products',
}: ProductSectionProps) {
  if (products.length === 0) return null

  return (
    <section aria-labelledby={id} className="mx-auto max-w-7xl px-4 pb-12 pt-2 md:px-8 md:pb-14 md:pt-3 lg:px-16">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="font-heading text-2xl font-semibold md:text-3xl" id={id}>
            {title}
          </h2>
          <p className="mt-1 text-sm text-[#514534] md:text-base">{subtitle}</p>
        </div>
        <Link
          className="flex items-center gap-1 text-sm font-semibold text-[#a83635] hover:underline"
          href={viewAllHref}
        >
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
