import { CategoryService } from '@bharatmart/services'
import { ProductForm } from '@/components/products/ProductForm'
import { requireMerchant } from '@/lib/merchant-context'

export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  await requireMerchant()
  const categories = await CategoryService.getActiveCategories()

  return (
    <main className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold">Add product</h1>
      <ProductForm categories={categories} />
    </main>
  )
}
