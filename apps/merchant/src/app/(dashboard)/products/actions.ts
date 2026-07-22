'use server'

import { revalidatePath } from 'next/cache'
import {
  ProductService,
  RateLimitError,
  ValidationError,
  enforceRateLimit,
  RATE_LIMITS,
} from '@bharatmart/services'
import type { ProductBulkInput, ProductInput } from '@bharatmart/validation'
import { requireMerchant } from '@/lib/merchant-context'

export async function createProductAction(
  input: ProductInput,
  status: 'DRAFT' | 'ACTIVE',
) {
  const { merchant } = await requireMerchant()
  try {
    await enforceRateLimit(merchant.id, RATE_LIMITS.productWrite, 'add another product')
    const product = await ProductService.create(merchant.id, input, status)
    revalidatePath('/products')
    return { ok: true as const, id: product.id }
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof RateLimitError || error instanceof ValidationError
          ? error.message
          : 'Unable to save product.',
    }
  }
}

export async function updateProductAction(productId: string, input: ProductInput) {
  const { merchant } = await requireMerchant()
  try {
    await enforceRateLimit(merchant.id, RATE_LIMITS.productWrite, 'update products')
    await ProductService.update(merchant.id, productId, input)
    revalidatePath('/products')
    revalidatePath(`/products/${productId}/edit`)
    return { ok: true as const }
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof RateLimitError || error instanceof ValidationError
          ? error.message
          : 'Unable to update product.',
    }
  }
}

export async function bulkCreateProductsAction(rows: ProductBulkInput) {
  const { merchant } = await requireMerchant()
  try {
    // Bulk jobs are rate-limited separately so a large CSV is not blocked as "20 writes/min".
    await enforceRateLimit(merchant.id, RATE_LIMITS.productBulk, 'run another bulk import')
    const result = await ProductService.createBulk(merchant.id, rows)
    revalidatePath('/products')
    return { ok: true as const, ...result }
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof RateLimitError || error instanceof ValidationError
          ? error.message
          : 'Unable to import products.',
      createdCount: 0,
      createdIds: [] as string[],
      errors: [] as Array<{ row: number; message: string }>,
    }
  }
}

export async function duplicateProductAction(productId: string) {
  const { merchant } = await requireMerchant()
  await enforceRateLimit(merchant.id, RATE_LIMITS.productWrite, 'duplicate products')
  await ProductService.duplicate(merchant.id, productId)
  revalidatePath('/products')
}

export async function setProductStatusAction(
  productId: string,
  status: 'DRAFT' | 'ACTIVE' | 'OUT_OF_STOCK' | 'ARCHIVED',
) {
  const { merchant } = await requireMerchant()
  await ProductService.setStatus(merchant.id, productId, status)
  revalidatePath('/products')
  revalidatePath(`/products/${productId}/edit`)
  revalidatePath(`/products/${productId}/preview`)
}

export async function adjustStockAction(productId: string, stockQuantity: number) {
  const { merchant } = await requireMerchant()
  await ProductService.adjustStock(merchant.id, productId, stockQuantity)
  revalidatePath('/products')
  revalidatePath(`/products/${productId}/edit`)
  revalidatePath(`/products/${productId}/preview`)
}

export async function deleteProductAction(productId: string) {
  const { merchant } = await requireMerchant()
  await ProductService.remove(merchant.id, productId)
  revalidatePath('/products')
}
