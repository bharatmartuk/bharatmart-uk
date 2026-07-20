'use client'

import { Heart } from 'lucide-react'
import { cn } from '@bharatmart/utils'
import { useWishlistStore, type WishlistItem } from '@/lib/store/wishlist-store'

export function FavoriteButton({
  item,
  className,
  size = 'md',
}: {
  item: WishlistItem
  className?: string
  size?: 'md' | 'lg'
}) {
  const toggleItem = useWishlistStore((state) => state.toggleItem)
  const saved = useWishlistStore((state) =>
    state.items.some((entry) => entry.productId === item.productId),
  )

  return (
    <button
      aria-label={saved ? `Remove ${item.name} from favourites` : `Save ${item.name} to favourites`}
      aria-pressed={saved}
      className={cn(
        'rounded-full bg-white/90 text-[#a83635] shadow-sm transition hover:bg-white',
        size === 'lg' ? 'p-3' : 'p-2',
        saved && 'bg-white',
        className,
      )}
      onClick={() => toggleItem(item)}
      type="button"
    >
      <Heart className={cn(size === 'lg' ? 'h-5 w-5' : 'h-4 w-4', saved && 'fill-current')} />
    </button>
  )
}
