import Image from 'next/image'
import Link from 'next/link'
import { Gem, Home, Package, ShoppingBasket, Sparkles } from 'lucide-react'
import { Card } from '@bharatmart/ui'
import type { CategorySummary } from '@bharatmart/services'
import { categoryIconSrc } from '@/lib/category-icon'

const iconMap = [ShoppingBasket, Sparkles, Package, Gem, Home]

export function CategoryGrid({ categories }: { categories: CategorySummary[] }) {
  if (categories.length === 0) return null

  return (
    <section aria-labelledby="category-heading" className="mx-auto max-w-7xl px-4 pb-2 pt-6 md:px-8 md:pb-3 md:pt-8 lg:px-16">
      <div className="mb-5 flex items-center justify-between md:hidden">
        <h2 className="font-heading text-xl font-semibold" id="category-heading">
          Shop by Category
        </h2>
        <Link className="text-xs font-semibold text-[#7f5700]" href="/products">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-4 md:grid-cols-8">
        {categories.slice(0, 8).map((category, index) => {
          const Icon = iconMap[index % iconMap.length] ?? Package
          return (
            <Link
              className="group flex min-w-0 flex-col items-center gap-3 text-center"
              href={`/products?category=${category.slug}`}
              key={category.id}
            >
              <Card className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-[#e8d9c8] bg-transparent shadow-none transition group-hover:scale-105 group-hover:border-[#e8a317] md:h-20 md:w-20">
                {categoryIconSrc(category) ? (
                  <Image
                    alt=""
                    className="h-full w-full object-contain object-center"
                    height={80}
                    src={categoryIconSrc(category)!}
                    unoptimized
                    width={80}
                  />
                ) : (
                  <Icon className="h-6 w-6 text-[#7f5700] md:h-8 md:w-8" />
                )}
              </Card>
              <span className="line-clamp-2 text-[11px] font-medium leading-4 text-[#514534] group-hover:text-[#7f5700] md:text-xs">
                {category.name}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
