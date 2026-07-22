'use server'

import { revalidatePath } from 'next/cache'
import { CategoryAdminService } from '@bharatmart/services'

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
