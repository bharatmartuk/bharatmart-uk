import Link from 'next/link'
import { Card, CategoryIcon } from '@bharatmart/ui'
import type { CategorySummary } from '@bharatmart/services'

function sortCategoriesForDisplay(categories: CategorySummary[]) {
  return [...categories].sort((a, b) => {
    if (a.comingSoon !== b.comingSoon) return a.comingSoon ? 1 : -1
    return 0
  })
}

export function CategoryGrid({ categories }: { categories: CategorySummary[] }) {
  const visibleCategories = sortCategoriesForDisplay(categories).slice(0, 8)

  if (visibleCategories.length === 0) return null

  return (
    <section
      aria-labelledby="category-heading"
      className="mx-auto max-w-7xl px-4 pb-2 pt-6 md:px-8 md:pb-3 md:pt-8 lg:px-16"
    >
      <div className="mb-5 flex items-center justify-between">
        <h2 className="font-heading text-xl font-semibold md:text-2xl" id="category-heading">
          Shop by Category
        </h2>
        <Link className="text-xs font-semibold text-[#7f5700] md:text-sm" href="/products">
          View all
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-4 md:grid-cols-8">
        {visibleCategories.map((category) => {
          const content = (
            <>
              <Card className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-[#e8d9c8] bg-transparent shadow-none transition group-hover:scale-105 group-hover:border-[#e8a317] md:h-20 md:w-20">
                <CategoryIcon
                  className="h-6 w-6 md:h-8 md:w-8"
                  name={category.name}
                  slug={category.slug}
                />
                {category.comingSoon ? (
                  <span className="absolute inset-x-0 bottom-0 bg-[#7f5700]/90 py-0.5 text-center text-[8px] font-bold uppercase tracking-wide text-white">
                    Soon
                  </span>
                ) : null}
              </Card>
              <span className="line-clamp-2 text-[11px] font-medium leading-4 text-[#514534] group-hover:text-[#7f5700] md:text-xs">
                {category.name}
                {category.comingSoon ? (
                  <span className="mt-0.5 block text-[9px] font-semibold uppercase text-[#a83635]">
                    Coming soon
                  </span>
                ) : null}
              </span>
            </>
          )

          if (category.comingSoon) {
            return (
              <div
                aria-disabled
                className="group flex min-w-0 cursor-default flex-col items-center gap-3 text-center opacity-80"
                key={category.id}
              >
                {content}
              </div>
            )
          }

          return (
            <Link
              className="group flex min-w-0 flex-col items-center gap-3 text-center"
              href={`/products?category=${category.slug}`}
              key={category.id}
            >
              {content}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
