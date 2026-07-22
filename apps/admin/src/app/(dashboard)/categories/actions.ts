'use server'

import { revalidatePath } from 'next/cache'
import { CategoryAdminService, ValidationError, NotFoundError } from '@bharatmart/services'

function revalidateMarketplacePaths() {
  revalidatePath('/marketplace')
  revalidatePath('/categories')
  revalidatePath('/banners')
  revalidatePath('/')
}

export async function reorderCategoriesAction(orderedIds: string[]) {
  await CategoryAdminService.reorder(orderedIds)
  revalidateMarketplacePaths()
}

export async function createCategoryAction(input: {
  name: string
  slug: string
  comingSoon?: boolean
}) {
  await CategoryAdminService.create(input)
  revalidateMarketplacePaths()
}

export async function updateCategoryAction(input: {
  id: string
  name: string
  slug: string
  isActive: boolean
  comingSoon: boolean
}) {
  await CategoryAdminService.update(input.id, {
    name: input.name.trim(),
    slug: input.slug.trim(),
    isActive: input.isActive,
    comingSoon: input.comingSoon,
  })
  revalidateMarketplacePaths()
  revalidatePath('/products')
}

export async function deleteCategoryAction(id: string) {
  try {
    await CategoryAdminService.remove(id)
    revalidateMarketplacePaths()
    revalidatePath('/products')
    return { ok: true as const }
  } catch (error) {
    return {
      ok: false as const,
      error:
        error instanceof ValidationError || error instanceof NotFoundError
          ? error.message
          : 'Unable to delete this category.',
    }
  }
}
