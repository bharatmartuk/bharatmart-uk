'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from '@bharatmart/ui'
import { consumePendingAction } from '@/lib/pending-action'
import { useCartStore } from '@/lib/store/cart-store'
import { useWishlistStore } from '@/lib/store/wishlist-store'

export function PendingActionHydrator() {
  const { status } = useSession()
  const addCartItem = useCartStore((state) => state.addItem)
  const addWishlistItem = useWishlistStore((state) => state.addItem)

  useEffect(() => {
    if (status !== 'authenticated') return

    const action = consumePendingAction()
    if (!action) return

    if (action.type === 'cart') {
      addCartItem(action.item, action.quantity ?? 1)
      toast.success(`Added “${action.item.name}” to cart`)
      return
    }

    addWishlistItem(action.item)
    toast.success(`Added “${action.item.name}” to favourites`)
  }, [addCartItem, addWishlistItem, status])

  return null
}
