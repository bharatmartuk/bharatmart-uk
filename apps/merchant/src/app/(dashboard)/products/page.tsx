import Link from 'next/link'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@bharatmart/ui'
import { CategoryService, ProductService } from '@bharatmart/services'
import { requireMerchant } from '@/lib/merchant-context'
import { ProductRowActions } from '@/components/products/ProductRowActions'

export const dynamic = 'force-dynamic'

type SearchParams = Record<string, string | string[] | undefined>

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function MerchantProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const { merchant } = await requireMerchant()
  const q = first(params.q)
  const categoryId = first(params.categoryId)
  const status = first(params.status) as
    | 'DRAFT'
    | 'ACTIVE'
    | 'OUT_OF_STOCK'
    | 'ARCHIVED'
    | undefined

  const [products, categories] = await Promise.all([
    ProductService.getForMerchant(merchant.id, {
      ...(q ? { q } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(status ? { status } : {}),
    }),
    CategoryService.getActiveCategories(),
  ])

  return (
    <main className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-3xl font-semibold">Products</h1>
          <p className="text-sm text-[#514534]">{products.length} catalogue items</p>
        </div>
        <Button asChild className="bg-[#7f5700] text-white hover:bg-[#604100]">
          <Link href="/products/new">Add product</Link>
        </Button>
      </div>

      <Card className="border-[#d6c4ad]">
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 md:grid-cols-4">
            <input
              className="rounded-md border border-[#d6c4ad] bg-white px-3 py-2 text-sm"
              defaultValue={q}
              name="q"
              placeholder="Search products"
            />
            <select
              className="rounded-md border border-[#d6c4ad] bg-white px-3 py-2 text-sm"
              defaultValue={categoryId}
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
              className="rounded-md border border-[#d6c4ad] bg-white px-3 py-2 text-sm"
              defaultValue={status}
              name="status"
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="OUT_OF_STOCK">Out of stock</option>
              <option value="ARCHIVED">Archived</option>
            </select>
            <Button type="submit" variant="outline">
              Apply
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-xl border border-[#d6c4ad] bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#f9f3ea] text-[#514534]">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr className="border-t border-[#eee7de]" key={product.id}>
                <td className="px-4 py-3">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-[#837561]">{product.category.name}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="secondary">{product.status}</Badge>
                </td>
                <td className="px-4 py-3">{product.stockQuantity}</td>
                <td className="px-4 py-3">£{(product.priceInPence / 100).toFixed(2)}</td>
                <td className="px-4 py-3">
                  <ProductRowActions productId={product.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
