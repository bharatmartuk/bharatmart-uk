import { NextResponse } from 'next/server'
import { prisma } from '@bharatmart/database'

/** Stable demo cart lines for the seeded customer (browser cart is client-only). */
const DEMO_CART_SLUGS = [
  { slug: 'ammas-homemade-andhra-avakaya', quantity: 1 },
  { slug: 'ammas-homemade-murukulu', quantity: 2 },
  { slug: 'handmade-sakinalu', quantity: 1 },
] as const

export async function GET() {
  const products = await prisma.product.findMany({
    where: {
      slug: { in: DEMO_CART_SLUGS.map((item) => item.slug) },
      status: 'ACTIVE',
    },
    include: {
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
      merchant: { select: { id: true, storeName: true } },
    },
  })

  const bySlug = new Map(products.map((product) => [product.slug, product]))
  const items = DEMO_CART_SLUGS.flatMap((entry) => {
    const product = bySlug.get(entry.slug)
    if (!product) return []
    return [
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        imageUrl: product.images[0]?.url ?? null,
        priceInPence: product.priceInPence,
        quantity: entry.quantity,
        stockQuantity: product.stockQuantity,
        merchantId: product.merchant.id,
        merchantName: product.merchant.storeName,
      },
    ]
  })

  return NextResponse.json({
    customerEmail: 'ananya.patel@bharatmart.uk',
    items,
  })
}
