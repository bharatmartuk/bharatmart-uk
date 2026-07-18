'use server'

import { revalidatePath } from 'next/cache'
import { CategoryAdminService } from '@bharatmart/services'

export async function reorderCategoriesAction(orderedIds: string[]) {
  await CategoryAdminService.reorder(orderedIds)
  revalidatePath('/categories')
}

export async function createCategoryAction(input: {
  name: string
  slug: string
}) {
  await CategoryAdminService.create(input)
  revalidatePath('/categories')
}
