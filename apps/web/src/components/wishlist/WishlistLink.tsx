'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useWishlistStore } from '@/lib/store/wishlist-store'

export function WishlistLink() {
  const count = useWishlistStore((state) => state.items.length)

  return (
    <Link
      aria-label={`Favourites with ${count} items`}
      className="relative rounded-full p-2 text-[#7f5700] transition hover:bg-[#eee7de]"
      href="/wishlist"
    >
      <Heart className="h-5 w-5" />
      {count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-[#a83635] px-1 text-center text-[10px] font-bold leading-4 text-white">
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </Link>
  )
}
