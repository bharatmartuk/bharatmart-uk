import { CategoryService } from '@bharatmart/services'
import { requireMerchant } from '@/lib/merchant-context'
import { BulkProductImport } from '@/components/products/BulkProductImport'

export const dynamic = 'force-dynamic'

export default async function BulkProductsPage() {
  await requireMerchant()
  const categories = await CategoryService.getActiveCategories()

  return (
    <main className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Bulk add products</h1>
        <p className="mt-1 text-sm text-[#514534]">
          Upload a CSV to create many products at once. Image URLs should already be hosted (for
          example on Cloudinary).
        </p>
      </div>
      <BulkProductImport categories={categories} />
    </main>
  )
}
