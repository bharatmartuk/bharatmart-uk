import 'server-only'

import type { Prisma } from '@bharatmart/database'
import { prisma } from '@bharatmart/database'

export type ProductSearchFilters = {
  q?: string | undefined
  category?: string | undefined
  merchantId?: string | undefined
  minPrice?: number | undefined
  maxPrice?: number | undefined
  minRating?: number | undefined
  inStockOnly?: boolean | undefined
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | undefined
  page?: number | undefined
  pageSize?: number | undefined
}

const productCardInclude = {
  images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
  merchant: { select: { id: true, storeName: true, storeSlug: true } },
  category: { select: { id: true, name: true, slug: true } },
} satisfies Prisma.ProductInclude

function buildWhere(filters: ProductSearchFilters): Prisma.ProductWhereInput {
  const and: Prisma.ProductWhereInput[] = [{ status: 'ACTIVE' }]

  if (filters.q?.trim()) {
    and.push({
      OR: [
        { name: { contains: filters.q.trim(), mode: 'insensitive' } },
        { description: { contains: filters.q.trim(), mode: 'insensitive' } },
      ],
    })
  }

  if (filters.category) {
    and.push({
      OR: [
        { category: { slug: filters.category } },
        { category: { parent: { slug: filters.category } } },
      ],
    })
  }

  if (filters.merchantId) {
    and.push({ merchantId: filters.merchantId })
  }

  if (filters.minPrice != null || filters.maxPrice != null) {
    and.push({
      priceInPence: {
        ...(filters.minPrice != null ? { gte: filters.minPrice } : {}),
        ...(filters.maxPrice != null ? { lte: filters.maxPrice } : {}),
      },
    })
  }

  if (filters.minRating != null) {
    and.push({ avgRating: { gte: filters.minRating } })
  }

  if (filters.inStockOnly) {
    and.push({ stockQuantity: { gt: 0 } })
  }

  return { AND: and }
}

function buildOrderBy(
  sort: ProductSearchFilters['sort'],
): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case 'price_asc':
      return [{ priceInPence: 'asc' }]
    case 'price_desc':
      return [{ priceInPence: 'desc' }]
    case 'rating':
      return [{ avgRating: 'desc' }, { reviewCount: 'desc' }]
    case 'newest':
      return [{ createdAt: 'desc' }]
    case 'relevance':
    default:
      return [{ reviewCount: 'desc' }, { avgRating: 'desc' }, { createdAt: 'desc' }]
  }
}

export const productRepository = {
  findById(id: string) {
    return prisma.product.findUnique({ where: { id } })
  },

  findBySlug(slug: string) {
    return prisma.product.findFirst({
      where: { slug, status: 'ACTIVE' },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        category: { select: { id: true, name: true, slug: true } },
        merchant: {
          select: {
            id: true,
            storeName: true,
            storeSlug: true,
            storeLogoUrl: true,
            storeDescription: true,
            avgRating: true,
            user: { select: { phone: true } },
          },
        },
      },
    })
  },

  findTrending(limit: number) {
    return prisma.product.findMany({
      where: { status: 'ACTIVE' },
      include: productCardInclude,
      orderBy: [{ reviewCount: 'desc' }, { avgRating: 'desc' }],
      take: limit,
    })
  },

  async search(filters: ProductSearchFilters) {
    const page = Math.max(filters.page ?? 1, 1)
    const pageSize = Math.min(Math.max(filters.pageSize ?? 24, 1), 48)
    const where = buildWhere(filters)
    const orderBy = buildOrderBy(filters.sort)

    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: productCardInclude,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ])

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
    }
  },

  findLowStock(merchantId: string, threshold: number) {
    return prisma.product.findMany({
      where: {
        merchantId,
        status: { in: ['ACTIVE', 'OUT_OF_STOCK'] },
        stockQuantity: { lte: threshold },
      },
      orderBy: { stockQuantity: 'asc' },
      take: 20,
    })
  },
}
