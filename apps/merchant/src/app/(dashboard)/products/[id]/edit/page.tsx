import { notFound } from 'next/navigation'
import { CategoryService } from '@bharatmart/services'
import { prisma } from '@bharatmart/database'
import { ProductForm } from '@/components/products/ProductForm'
import { requireMerchant } from '@/lib/merchant-context'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { merchant } = await requireMerchant()
  const { id } = await params
  const [product, categories] = await Promise.all([
    prisma.product.findFirst({
      where: { id, merchantId: merchant.id },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    }),
    CategoryService.getActiveCategories(),
  ])

  if (!product) notFound()

  return (
    <main className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold">Edit product</h1>
      <ProductForm
        categories={categories}
        initial={{
          name: product.name,
          slug: product.slug,
          description: product.description,
          categoryId: product.categoryId,
          priceInPence: product.priceInPence,
          stockQuantity: product.stockQuantity,
          sku: product.sku,
          imageUrls: product.images.map((image) => image.url),
          status: product.status,
        }}
        productId={product.id}
      />
    </main>
  )
}
