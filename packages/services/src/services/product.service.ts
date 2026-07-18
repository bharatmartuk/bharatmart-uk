import 'server-only'

import { productSchema, type ProductInput } from '@bharatmart/validation'
import { prisma } from '@bharatmart/database'
import {
  productRepository,
  type ProductSearchFilters,
} from '../repositories/product.repository'
import { NotFoundError, ValidationError } from '../errors'

export interface ProductSummary {
  id: string
  merchantId: string
  merchantName: string
  merchantSlug: string
  name: string
  slug: string
  priceInPence: number
  stockQuantity: number
  avgRating: number
  reviewCount: number
  imageUrl: string | null
  categoryName?: string | undefined
  categorySlug?: string | undefined
}

export type { ProductSearchFilters }

function toSummary(product: {
  id: string
  merchantId: string
  name: string
  slug: string
  priceInPence: number
  stockQuantity: number
  avgRating: { toNumber(): number }
  reviewCount: number
  images: Array<{ url: string }>
  merchant: { storeName: string; storeSlug: string }
  category?: { name: string; slug: string }
}): ProductSummary {
  return {
    id: product.id,
    merchantId: product.merchantId,
    merchantName: product.merchant.storeName,
    merchantSlug: product.merchant.storeSlug,
    name: product.name,
    slug: product.slug,
    priceInPence: product.priceInPence,
    stockQuantity: product.stockQuantity,
    avgRating: product.avgRating.toNumber(),
    reviewCount: product.reviewCount,
    imageUrl: product.images[0]?.url ?? null,
    categoryName: product.category?.name,
    categorySlug: product.category?.slug,
  }
}

export const ProductService = {
  async getTrending(limit = 8): Promise<ProductSummary[]> {
    const products = await productRepository.findTrending(limit)
    return products.map(toSummary)
  },

  async searchProducts(filters: ProductSearchFilters = {}) {
    const result = await productRepository.search(filters)
    return {
      ...result,
      items: result.items.map(toSummary),
    }
  },

  getBySlug(slug: string) {
    return productRepository.findBySlug(slug)
  },

  getLowStock(merchantId: string, threshold = 5) {
    return productRepository.findLowStock(merchantId, threshold)
  },

  getForMerchant(
    merchantId: string,
    filters?: {
      q?: string
      categoryId?: string
      status?: 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED'
    },
  ) {
    return prisma.product.findMany({
      where: {
        merchantId,
        ...(filters?.q
          ? { name: { contains: filters.q, mode: 'insensitive' as const } }
          : {}),
        ...(filters?.categoryId ? { categoryId: filters.categoryId } : {}),
        ...(filters?.status ? { status: filters.status } : {}),
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' }, take: 1 },
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })
  },

  async create(
    merchantId: string,
    input: ProductInput,
    status: 'DRAFT' | 'ACTIVE' = 'DRAFT',
  ) {
    const parsed = productSchema.safeParse(input)
    if (!parsed.success) throw new ValidationError('Invalid product details.')

    return prisma.product.create({
      data: {
        merchantId,
        categoryId: parsed.data.categoryId,
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description,
        priceInPence: parsed.data.priceInPence,
        stockQuantity: parsed.data.stockQuantity,
        sku: parsed.data.sku,
        status,
        images: {
          create: parsed.data.imageUrls.map((url, index) => ({
            url,
            sortOrder: index,
          })),
        },
      },
      include: { images: true },
    })
  },

  async update(merchantId: string, productId: string, input: ProductInput) {
    const parsed = productSchema.safeParse(input)
    if (!parsed.success) throw new ValidationError('Invalid product details.')

    const existing = await prisma.product.findFirst({
      where: { id: productId, merchantId },
    })
    if (!existing) throw new NotFoundError('Product not found.')

    await prisma.productImage.deleteMany({ where: { productId } })

    return prisma.product.update({
      where: { id: productId },
      data: {
        categoryId: parsed.data.categoryId,
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description,
        priceInPence: parsed.data.priceInPence,
        stockQuantity: parsed.data.stockQuantity,
        sku: parsed.data.sku,
        status: parsed.data.status ?? existing.status,
        images: {
          create: parsed.data.imageUrls.map((url, index) => ({
            url,
            sortOrder: index,
          })),
        },
      },
      include: { images: true },
    })
  },

  async remove(merchantId: string, productId: string) {
    const existing = await prisma.product.findFirst({
      where: { id: productId, merchantId },
    })
    if (!existing) throw new NotFoundError('Product not found.')

    await prisma.product.update({
      where: { id: productId },
      data: { status: 'ARCHIVED' },
    })
  },

  async duplicate(merchantId: string, productId: string) {
    const existing = await prisma.product.findFirst({
      where: { id: productId, merchantId },
      include: { images: { orderBy: { sortOrder: 'asc' } } },
    })
    if (!existing) throw new NotFoundError('Product not found.')

    return prisma.product.create({
      data: {
        merchantId,
        categoryId: existing.categoryId,
        name: `${existing.name} (Copy)`,
        slug: `${existing.slug}-copy-${Date.now()}`,
        description: existing.description,
        priceInPence: existing.priceInPence,
        stockQuantity: existing.stockQuantity,
        sku: `${existing.sku}-COPY-${Date.now().toString().slice(-4)}`,
        status: 'DRAFT',
        images: {
          create: existing.images.map((image) => ({
            url: image.url,
            sortOrder: image.sortOrder,
          })),
        },
      },
    })
  },
}

export const productService = ProductService
