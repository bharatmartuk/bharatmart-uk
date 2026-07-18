import 'server-only'

import { categoryRepository } from '../repositories/category.repository'

export interface CategorySummary {
  id: string
  name: string
  slug: string
  iconUrl: string | null
}

export const CategoryService = {
  async getTopLevelCategories(): Promise<CategorySummary[]> {
    const categories = await categoryRepository.findTopLevel()
    return categories.map(({ id, name, slug, iconUrl }) => ({ id, name, slug, iconUrl }))
  },

  getBySlug(slug: string) {
    return categoryRepository.findBySlug(slug)
  },

  getActiveCategories() {
    return categoryRepository.findActive()
  },
}
