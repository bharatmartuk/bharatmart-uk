import { NextResponse } from 'next/server'
import {
  RateLimitError,
  clientIpFromHeaders,
  enforceRateLimit,
  RATE_LIMITS,
} from '@bharatmart/services'
import { prisma } from '@bharatmart/database'
import { rankByFuzzy } from '@/lib/search-rank'

export const dynamic = 'force-dynamic'

const SELECT = {
  id: true,
  name: true,
  slug: true,
  priceInPence: true,
  stockQuantity: true,
  images: { orderBy: { sortOrder: 'asc' as const }, take: 1, select: { url: true } },
  merchant: { select: { storeName: true } },
  category: { select: { name: true } },
} as const

export async function GET(request: Request) {
  try {
    const ip = clientIpFromHeaders(new Headers(request.headers))
    await enforceRateLimit(ip, RATE_LIMITS.search, 'search again')
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: error.message, items: [] },
        { status: 429, headers: { 'Retry-After': String(error.retryAfterSeconds) } },
      )
    }
    throw error
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')?.trim() ?? ''
  const limit = Math.min(Number(searchParams.get('limit') ?? 8) || 8, 12)

  const products = await prisma.product.findMany({
    where: { status: 'ACTIVE', stockQuantity: { gt: 0 } },
    select: SELECT,
    orderBy: [{ reviewCount: 'desc' }, { avgRating: 'desc' }, { name: 'asc' }],
    take: q ? 120 : limit,
  })

  const mapped = products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    priceInPence: product.priceInPence,
    imageUrl: product.images[0]?.url ?? null,
    merchantName: product.merchant.storeName,
    categoryName: product.category.name,
  }))

  const items = q
    ? rankByFuzzy(
        mapped,
        q,
        (item) => [item.name, item.merchantName, item.categoryName, item.slug],
        limit,
      )
    : mapped.slice(0, limit)

  return NextResponse.json({
    q,
    mode: q ? 'autocomplete' : 'recommendations',
    items,
  })
}
