import Link from 'next/link'
import { Suspense } from 'react'
import {
  CategoryService,
  MerchantService,
  ProductService,
  type ProductSearchFilters,
} from '@bharatmart/services'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductFilters } from '@/components/product/ProductFilters'
import { ProductsToolbar } from '@/components/product/ProductsToolbar'
import { ProductPagination } from '@/components/product/ProductPagination'

export const dynamic = 'force-dynamic'

type SearchParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function parseFilters(searchParams: SearchParams): ProductSearchFilters {
  const sort = first(searchParams.sort)
  const validSort =
    sort === 'price_asc' ||
    sort === 'price_desc' ||
    sort === 'rating' ||
    sort === 'newest' ||
    sort === 'relevance'
      ? sort
      : 'relevance'

  return {
    q: first(searchParams.q),
    category: first(searchParams.category),
    merchantId: first(searchParams.merchantId),
    minPrice: first(searchParams.minPrice) ? Number(first(searchParams.minPrice)) : undefined,
    maxPrice: first(searchParams.maxPrice) ? Number(first(searchParams.maxPrice)) : undefined,
    minRating: first(searchParams.minRating) ? Number(first(searchParams.minRating)) : undefined,
    inStockOnly: first(searchParams.inStock) === '1',
    sort: validSort,
    page: first(searchParams.page) ? Number(first(searchParams.page)) : 1,
    pageSize: 24,
  }
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const filters = parseFilters(params)
  const [result, categories, merchants, activeCategory] = await Promise.all([
    ProductService.searchProducts(filters),
    CategoryService.getTopLevelCategories(),
    MerchantService.getFilterOptions(),
    filters.category ? CategoryService.getBySlug(filters.category) : Promise.resolve(null),
  ])

  const plainParams: Record<string, string | undefined> = {
    q: filters.q,
    category: filters.category,
    merchantId: filters.merchantId,
    minPrice: filters.minPrice != null ? String(filters.minPrice) : undefined,
    maxPrice: filters.maxPrice != null ? String(filters.maxPrice) : undefined,
    minRating: filters.minRating != null ? String(filters.minRating) : undefined,
    inStock: filters.inStockOnly ? '1' : undefined,
    sort: filters.sort === 'relevance' ? undefined : filters.sort,
  }

  const heading = activeCategory
    ? `${result.total} products in '${activeCategory.name}'`
    : filters.q
      ? `${result.total} results for '${filters.q}'`
      : `${result.total} products`

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8 lg:px-16">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start lg:gap-8">
        {/* Desktop filters: stay pinned under the site header */}
        <aside className="hidden lg:block lg:sticky lg:top-20 lg:z-20 lg:self-start lg:max-h-[calc(100vh-5.5rem)] lg:overflow-y-auto lg:pb-4">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-xl bg-[#f4ede4]" />}>
            <ProductFilters categories={categories} merchants={merchants} />
          </Suspense>
        </aside>

        <section className="min-w-0">
          {/* Scrolls with the page */}
          <nav aria-label="Breadcrumb" className="mb-4 text-sm text-[#837561]">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link className="hover:text-[#7f5700]" href="/">
                  Home
                </Link>
              </li>
              {activeCategory?.parent ? (
                <>
                  <li>/</li>
                  <li>
                    <Link
                      className="hover:text-[#7f5700]"
                      href={`/products?category=${activeCategory.parent.slug}`}
                    >
                      {activeCategory.parent.name}
                    </Link>
                  </li>
                </>
              ) : null}
              <li>/</li>
              <li className="font-medium text-[#1e1b16]">
                {activeCategory?.name ?? (filters.q ? `Search: ${filters.q}` : 'All products')}
              </li>
            </ol>
          </nav>

          <div className="mb-4">
            <h1 className="font-heading text-3xl font-semibold text-[#1e1b16]">{heading}</h1>
            <p className="mt-1 text-sm text-[#514534]">
              Authentic Indian products from verified UK merchants.
            </p>
          </div>

          {/* Sort (and mobile Filters): pinned under the site header */}
          <div className="sticky top-16 z-30 -mx-4 mb-4 border-b border-[#e8d9c8] bg-[#fff8f0] px-4 py-3 md:top-20 md:mx-0 md:px-0">
            <Suspense fallback={null}>
              <ProductsToolbar categories={categories} merchants={merchants} />
            </Suspense>
          </div>

          {result.items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#d6c4ad] bg-white p-10 text-center">
              <h2 className="text-lg font-semibold">No products match these filters</h2>
              <p className="mt-2 text-sm text-[#514534]">
                Try clearing a filter or browsing all products.
              </p>
              <Link
                className="mt-4 inline-block text-sm font-semibold text-[#7f5700] underline"
                href="/products"
              >
                Reset filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4">
              {result.items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <ProductPagination
            page={result.page}
            searchParams={plainParams}
            totalPages={result.totalPages}
          />
        </section>
      </div>
    </main>
  )
}
