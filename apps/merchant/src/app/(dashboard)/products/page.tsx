import Image from 'next/image'
import Link from 'next/link'
import {
  Plus,
  RotateCcw,
  Search,
  ShoppingCart,
  Upload,
} from 'lucide-react'
import { Button, Checkbox } from '@bharatmart/ui'
import { CategoryService, ProductService } from '@bharatmart/services'
import { requireMerchant } from '@/lib/merchant-context'
import { ProductRowActions } from '@/components/products/ProductRowActions'
import { StockAdjuster } from '@/components/products/StockAdjuster'
import { ProductStatusBadge } from '@/components/products/ProductStatusBadge'
import { ProductKpiCards, ProductsEmptyHint } from '@/components/products/ProductKpiCards'
import { resolveMarketplaceAssetUrl } from '@/lib/resolve-asset-url'

export const dynamic = 'force-dynamic'

type SearchParams = Record<string, string | string[] | undefined>

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const
const LOW_STOCK_THRESHOLD = 5

const priceFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

type SortKey = 'newest' | 'name' | 'price-asc' | 'price-desc' | 'stock'

function parseSort(value: string | undefined): SortKey {
  if (
    value === 'name' ||
    value === 'price-asc' ||
    value === 'price-desc' ||
    value === 'stock' ||
    value === 'newest'
  ) {
    return value
  }
  return 'newest'
}

function parsePageSize(value: string | undefined) {
  const n = Number(value)
  return PAGE_SIZE_OPTIONS.includes(n as (typeof PAGE_SIZE_OPTIONS)[number])
    ? (n as (typeof PAGE_SIZE_OPTIONS)[number])
    : 10
}

function matchesQuery(
  product: {
    name: string
    sku: string | null
    category: { name: string }
  },
  q: string,
) {
  const needle = q.trim().toLowerCase()
  if (!needle) return true
  return (
    product.name.toLowerCase().includes(needle) ||
    (product.sku?.toLowerCase().includes(needle) ?? false) ||
    product.category.name.toLowerCase().includes(needle)
  )
}

function sortProducts<
  T extends { name: string; priceInPence: number; stockQuantity: number; updatedAt: Date },
>(products: T[], sort: SortKey) {
  const copy = [...products]
  switch (sort) {
    case 'name':
      return copy.sort((a, b) => a.name.localeCompare(b.name))
    case 'price-asc':
      return copy.sort((a, b) => a.priceInPence - b.priceInPence)
    case 'price-desc':
      return copy.sort((a, b) => b.priceInPence - a.priceInPence)
    case 'stock':
      return copy.sort((a, b) => a.stockQuantity - b.stockQuantity)
    case 'newest':
    default:
      return copy.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }
}

function buildQuery(params: Record<string, string | undefined>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value)
  }
  const qs = search.toString()
  return qs ? `/products?${qs}` : '/products'
}

export default async function MerchantProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { merchant } = await requireMerchant()
  const q = first(params.q) ?? ''
  const categoryId = first(params.categoryId)
  const status = first(params.status) as
    | 'DRAFT'
    | 'ACTIVE'
    | 'OUT_OF_STOCK'
    | 'ARCHIVED'
    | undefined
  const sort = parseSort(first(params.sort))
  const pageSize = parsePageSize(first(params.pageSize))
  const page = Math.max(1, Number(first(params.page) ?? '1') || 1)

  const [allProducts, categories] = await Promise.all([
    ProductService.getForMerchant(merchant.id, {
      ...(categoryId ? { categoryId } : {}),
      ...(status ? { status } : {}),
    }),
    CategoryService.getActiveCategories(),
  ])

  // KPIs always reflect the full merchant catalogue.
  const catalogue =
    status || categoryId ? await ProductService.getForMerchant(merchant.id) : allProducts

  const kpis = {
    total: catalogue.length,
    active: catalogue.filter((p) => p.status === 'ACTIVE' && p.stockQuantity > 0).length,
    outOfStock: catalogue.filter(
      (p) => p.status === 'OUT_OF_STOCK' || p.stockQuantity <= 0,
    ).length,
    drafts: catalogue.filter((p) => p.status === 'DRAFT').length,
    inventoryValueInPence: catalogue.reduce(
      (sum, p) => sum + p.priceInPence * Math.max(p.stockQuantity, 0),
      0,
    ),
  }

  const filtered = sortProducts(
    allProducts.filter((product) => matchesQuery(product, q)),
    sort,
  )
  const totalFiltered = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize))
  const safePage = Math.min(page, totalPages)
  const startIndex = (safePage - 1) * pageSize
  const pageProducts = filtered.slice(startIndex, startIndex + pageSize)
  const showingFrom = totalFiltered === 0 ? 0 : startIndex + 1
  const showingTo = Math.min(startIndex + pageSize, totalFiltered)

  const filterDefaults = {
    ...(q ? { q } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(status ? { status } : {}),
    ...(sort !== 'newest' ? { sort } : {}),
    ...(pageSize !== 10 ? { pageSize: String(pageSize) } : {}),
  }

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-[#1e1b16]">
            Products
          </h1>
          <p className="mt-1 text-sm text-[#514534]">
            {kpis.total} catalogue item{kpis.total === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            asChild
            className="border-[#d6c4ad] bg-white text-[#1e1b16] hover:bg-[#f9f3ea]"
            variant="outline"
          >
            <Link href="/products/bulk">
              <Upload className="mr-2 h-4 w-4" aria-hidden />
              Bulk Import CSV
            </Link>
          </Button>
          <Button asChild className="bg-[#7f5700] text-white hover:bg-[#604100]">
            <Link href="/products/new">
              <Plus className="mr-2 h-4 w-4" aria-hidden />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      <ProductKpiCards kpis={kpis} />

      <form className="flex flex-col gap-3 rounded-2xl border border-[#d6c4ad] bg-white p-3 shadow-sm lg:flex-row lg:items-center">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Search products</span>
          <Search
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#837561]"
          />
          <input
            className="h-10 w-full rounded-xl border border-[#d6c4ad] bg-[#fffdf9] py-2 pl-9 pr-3 text-sm outline-none transition focus:border-[#7f5700] focus:ring-2 focus:ring-[#7f5700]/20"
            defaultValue={q}
            name="q"
            placeholder="Search by product, SKU or category..."
          />
        </label>
        <select
          aria-label="Filter by category"
          className="h-10 rounded-xl border border-[#d6c4ad] bg-white px-3 text-sm outline-none focus:border-[#7f5700] focus:ring-2 focus:ring-[#7f5700]/20"
          defaultValue={categoryId ?? ''}
          name="categoryId"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter by status"
          className="h-10 rounded-xl border border-[#d6c4ad] bg-white px-3 text-sm outline-none focus:border-[#7f5700] focus:ring-2 focus:ring-[#7f5700]/20"
          defaultValue={status ?? ''}
          name="status"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="OUT_OF_STOCK">Out of stock</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <select
          aria-label="Sort products"
          className="h-10 rounded-xl border border-[#d6c4ad] bg-white px-3 text-sm outline-none focus:border-[#7f5700] focus:ring-2 focus:ring-[#7f5700]/20"
          defaultValue={sort}
          name="sort"
        >
          <option value="newest">Sort: Newest</option>
          <option value="name">Sort: Name</option>
          <option value="price-desc">Sort: Price high–low</option>
          <option value="price-asc">Sort: Price low–high</option>
          <option value="stock">Sort: Stock</option>
        </select>
        <input name="pageSize" type="hidden" value={String(pageSize)} />
        <div className="flex gap-2">
          <Button className="h-10 bg-[#7f5700] text-white hover:bg-[#604100]" type="submit">
            Apply
          </Button>
          <Button
            asChild
            className="h-10 border-[#d6c4ad] bg-white text-[#1e1b16] hover:bg-[#f9f3ea]"
            variant="outline"
          >
            <Link aria-label="Reset filters" href="/products">
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Reset
            </Link>
          </Button>
        </div>
      </form>

      {totalFiltered === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#d6c4ad] bg-white px-6 py-16 text-center shadow-sm">
          <ProductsEmptyHint />
          <p className="mt-2 text-sm text-[#837561]">
            Try clearing filters, or add a product to get started.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-[#d6c4ad] bg-white shadow-sm md:block">
            <table className="w-full table-fixed text-left text-sm">
              <thead className="bg-[#f9f3ea] text-xs font-semibold uppercase tracking-wide text-[#514534]">
                <tr>
                  <th className="w-12 px-3 py-3.5">
                    <span className="sr-only">Select</span>
                  </th>
                  <th className="px-3 py-3.5">Product</th>
                  <th className="w-[9rem] px-3 py-3.5">Status</th>
                  <th className="w-[13.5rem] px-3 py-3.5">Stock</th>
                  <th className="w-[6.5rem] px-3 py-3.5">Price</th>
                  <th className="w-[8.75rem] px-3 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                  {pageProducts.map((product) => {
                    const imageUrl = product.images[0]?.url
                      ? (resolveMarketplaceAssetUrl(product.images[0].url) ??
                        product.images[0].url)
                      : null
                    return (
                      <tr
                        className="border-t border-[#eee7de] transition-colors hover:bg-[#fffdf9]"
                        key={product.id}
                      >
                        <td className="px-3 py-4 align-middle">
                          <Checkbox
                            aria-label={`Select ${product.name}`}
                            className="border-[#d6c4ad]"
                          />
                        </td>
                        <td className="px-3 py-4">
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-[#f4ede4] ring-1 ring-[#eee7de]">
                              {imageUrl ? (
                                <Image
                                  alt=""
                                  className="object-cover"
                                  fill
                                  sizes="56px"
                                  src={imageUrl}
                                  unoptimized
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-[#837561]">
                                  <ShoppingCart className="h-5 w-5" aria-hidden />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold text-[#1e1b16]" title={product.name}>
                                {product.name}
                              </p>
                              <p className="truncate text-xs text-[#837561]">
                                {product.category.name}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-[#837561]">
                                SKU: {product.sku?.trim() ? product.sku : '—'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-4 align-middle">
                          <ProductStatusBadge
                            status={product.status}
                            stockQuantity={product.stockQuantity}
                          />
                        </td>
                        <td className="px-3 py-4 align-middle">
                          <StockAdjuster
                            productId={product.id}
                            stockQuantity={product.stockQuantity}
                          />
                        </td>
                        <td className="px-3 py-4 align-middle">
                          <p className="text-base font-semibold text-[#1e1b16]">
                            {priceFormatter.format(product.priceInPence / 100)}
                          </p>
                        </td>
                        <td className="px-3 py-4 align-middle">
                          <ProductRowActions
                            productId={product.id}
                            slug={product.slug}
                            status={product.status}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {pageProducts.map((product) => {
              const imageUrl = product.images[0]?.url
                ? (resolveMarketplaceAssetUrl(product.images[0].url) ?? product.images[0].url)
                : null
              const low =
                product.stockQuantity > 0 && product.stockQuantity <= LOW_STOCK_THRESHOLD
              return (
                <article
                  className="rounded-2xl border border-[#d6c4ad] bg-white p-4 shadow-sm"
                  key={product.id}
                >
                  <div className="flex gap-3">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f4ede4]">
                      {imageUrl ? (
                        <Image
                          alt=""
                          className="object-cover"
                          fill
                          sizes="80px"
                          src={imageUrl}
                          unoptimized
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h2 className="truncate font-semibold text-[#1e1b16]">{product.name}</h2>
                          <p className="text-xs text-[#837561]">{product.category.name}</p>
                          <p className="text-xs text-[#837561]">
                            SKU: {product.sku?.trim() ? product.sku : '—'}
                          </p>
                        </div>
                        <ProductStatusBadge
                          status={product.status}
                          stockQuantity={product.stockQuantity}
                        />
                      </div>
                      <p className="mt-2 text-lg font-semibold">
                        {priceFormatter.format(product.priceInPence / 100)}
                      </p>
                      <p className="text-xs text-[#837561]">
                        {low ? 'Low stock' : `${product.stockQuantity} units`}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-[#eee7de] pt-3">
                    <StockAdjuster productId={product.id} stockQuantity={product.stockQuantity} />
                  </div>
                  <div className="mt-3">
                    <ProductRowActions
                      productId={product.id}
                      slug={product.slug}
                      status={product.status}
                    />
                  </div>
                </article>
              )
            })}
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-[#d6c4ad] bg-white px-4 py-3 text-sm text-[#514534] shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p>
              Showing {showingFrom} to {showingTo} of {totalFiltered} product
              {totalFiltered === 1 ? '' : 's'}.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <form className="flex items-center gap-2">
                {q ? <input name="q" type="hidden" value={q} /> : null}
                {categoryId ? <input name="categoryId" type="hidden" value={categoryId} /> : null}
                {status ? <input name="status" type="hidden" value={status} /> : null}
                {sort !== 'newest' ? <input name="sort" type="hidden" value={sort} /> : null}
                <label className="flex items-center gap-2 text-xs">
                  <span className="sr-only">Rows per page</span>
                  <select
                    aria-label="Rows per page"
                    className="h-9 rounded-lg border border-[#d6c4ad] bg-white px-2"
                    defaultValue={String(pageSize)}
                    name="pageSize"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>
                        {size} per page
                      </option>
                    ))}
                  </select>
                </label>
                <Button className="h-9" size="sm" type="submit" variant="outline">
                  Apply
                </Button>
              </form>
              <div className="flex items-center gap-1">
                <Button asChild className="h-9 w-9 border-[#d6c4ad] p-0" variant="outline">
                  <Link
                    aria-label="Previous page"
                    className={safePage <= 1 ? 'pointer-events-none opacity-40' : ''}
                    href={buildQuery({
                      ...filterDefaults,
                      page: String(Math.max(1, safePage - 1)),
                    })}
                  >
                    ‹
                  </Link>
                </Button>
                <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-lg bg-[#7f5700] px-3 text-sm font-semibold text-white">
                  {safePage}
                </span>
                <Button asChild className="h-9 w-9 border-[#d6c4ad] p-0" variant="outline">
                  <Link
                    aria-label="Next page"
                    className={safePage >= totalPages ? 'pointer-events-none opacity-40' : ''}
                    href={buildQuery({
                      ...filterDefaults,
                      page: String(Math.min(totalPages, safePage + 1)),
                    })}
                  >
                    ›
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  )
}
