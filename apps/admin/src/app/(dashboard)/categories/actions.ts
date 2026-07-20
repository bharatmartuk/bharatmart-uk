'use server'

import { revalidatePath } from 'next/cache'
import { CategoryAdminService } from '@bharatmart/services'

export async function reorderCategoriesAction(orderedIds: string[]) {
  await CategoryAdminService.reorder(orderedIds)
  revalidatePath('/categories')
  revalidatePath('/')
}

export async function createCategoryAction(input: {
  name: string
  slug: string
}) {
  await CategoryAdminService.create(input)
  revalidatePath('/categories')
  revalidatePath('/')
}

export async function updateCategoryAction(input: {
  id: string
  name: string
  slug: string
  iconUrl: string
  isActive: boolean
}) {
  await CategoryAdminService.update(input.id, {
    name: input.name.trim(),
    slug: input.slug.trim(),
    iconUrl: input.iconUrl.trim() || null,
    isActive: input.isActive,
  })
  revalidatePath('/categories')
  revalidatePath('/')
  revalidatePath('/products')
}
