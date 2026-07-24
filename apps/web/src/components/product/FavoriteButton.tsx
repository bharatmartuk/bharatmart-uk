'use client'

import { Heart } from 'lucide-react'
import { Button, toast } from '@bharatmart/ui'
import { cn } from '@bharatmart/utils'
import { useRequireAuth } from '@/hooks/use-require-auth'
import { useWishlistStore, type WishlistItem } from '@/lib/store/wishlist-store'

export function FavoriteButton({
  item,
  className,
  size = 'md',
  variant = 'icon',
}: {
  item: WishlistItem
  className?: string
  size?: 'md' | 'lg'
  /** icon = circular heart overlay; labeled = full CTA next to Add to cart */
  variant?: 'icon' | 'labeled'
}) {
  const { requireAuth } = useRequireAuth()
  const toggleItem = useWishlistStore((state) => state.toggleItem)
  const removeItem = useWishlistStore((state) => state.removeItem)
  const saved = useWishlistStore((state) =>
    state.items.some((entry) => entry.productId === item.productId),
  )

  function handleClick() {
    if (saved) {
      removeItem(item.productId)
      toast.success(`Removed “${item.name}” from favourites`)
      return
    }

    requireAuth({ type: 'wishlist', item }, () => {
      toggleItem(item)
      toast.success(`Added “${item.name}” to favourites`)
    })
  }

  if (variant === 'labeled') {
    return (
      <Button
        aria-label={saved ? `Remove ${item.name} from favourites` : `Save ${item.name} to favourites`}
        aria-pressed={saved}
        className={cn(
          'h-11 border-[#a83635] px-6 text-[#a83635] hover:bg-[#f9f3ea]',
          saved && 'bg-[#f9f3ea]',
          className,
        )}
        onClick={handleClick}
        type="button"
        variant="outline"
      >
        <Heart className={cn('mr-2 h-4 w-4', saved && 'fill-current')} />
        {saved ? 'Saved to favourites' : 'Add to favourites'}
      </Button>
    )
  }

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
      onClick={handleClick}
      type="button"
    >
      <Heart className={cn(size === 'lg' ? 'h-5 w-5' : 'h-4 w-4', saved && 'fill-current')} />
    </button>
  )
}
