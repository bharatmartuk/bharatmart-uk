'use server'

import { revalidatePath } from 'next/cache'
import { ProductService, ValidationError } from '@bharatmart/services'
import type { ProductInput } from '@bharatmart/validation'
import { requireMerchant } from '@/lib/merchant-context'

export async function createProductAction(
  input: ProductInput,
  status: 'DRAFT' | 'ACTIVE',
) {
  const { merchant } = await requireMerchant()
  try {
    const product = await ProductService.create(merchant.id, input, status)
    revalidatePath('/products')
    return { ok: true as const, id: product.id }
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof ValidationError ? error.message : 'Unable to save product.',
    }
  }
}

export async function updateProductAction(productId: string, input: ProductInput) {
  const { merchant } = await requireMerchant()
  try {
    await ProductService.update(merchant.id, productId, input)
    revalidatePath('/products')
    revalidatePath(`/products/${productId}/edit`)
    return { ok: true as const }
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof ValidationError ? error.message : 'Unable to update product.',
    }
  }
}

export async function duplicateProductAction(productId: string) {
  const { merchant } = await requireMerchant()
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
