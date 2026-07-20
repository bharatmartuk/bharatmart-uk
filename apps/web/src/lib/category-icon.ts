import type { CategorySummary } from '@bharatmart/services'

const LOCAL_CATEGORY_ICONS: Record<string, string> = {
  'homemade-foods': '/categories/homemade-foods.png',
}

export function categoryIconSrc(category: Pick<CategorySummary, 'slug' | 'iconUrl'>) {
  const localIcon = LOCAL_CATEGORY_ICONS[category.slug]
  if (localIcon) return localIcon
  if (category.iconUrl?.startsWith('/')) return category.iconUrl
  return category.iconUrl
}
