import {
  Flower2,
  Gem,
  Home,
  Leaf,
  Package,
  Shirt,
  ShoppingBasket,
  Sparkles,
  Store,
  Utensils,
  Wheat,
  type LucideIcon,
} from 'lucide-react'
import { resolveCategoryIconKey, type CategoryIconKey } from '@bharatmart/utils'
import { cn } from '@bharatmart/utils'

const ICON_MAP: Record<CategoryIconKey, LucideIcon> = {
  utensils: Utensils,
  sparkles: Sparkles,
  shirt: Shirt,
  wheat: Wheat,
  package: Package,
  leaf: Leaf,
  'flower-2': Flower2,
  'shopping-basket': ShoppingBasket,
  gem: Gem,
  home: Home,
  store: Store,
}

type CategoryIconProps = {
  slug: string
  name?: string
  iconKey?: CategoryIconKey
  className?: string
}

export function CategoryIcon({ slug, name, iconKey, className }: CategoryIconProps) {
  const key = iconKey ?? resolveCategoryIconKey(slug, name)
  const Icon = ICON_MAP[key] ?? Package

  return <Icon aria-hidden className={cn('text-[#7f5700]', className)} />
}
