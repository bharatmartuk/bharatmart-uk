'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
  productId: string
  slug: string
  name: string
  imageUrl: string | null
  priceInPence: number
  merchantId: string
  merchantName: string
}

interface WishlistState {
  items: WishlistItem[]
  toggleItem: (item: WishlistItem) => void
  removeItem: (productId: string) => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set) => ({
      items: [],
      toggleItem: (item) =>
        set((state) => {
          const exists = state.items.some((entry) => entry.productId === item.productId)
          if (exists) {
            return { items: state.items.filter((entry) => entry.productId !== item.productId) }
          }
          return { items: [...state.items, item] }
        }),
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
    }),
    { name: 'bharatmart-wishlist' },
  ),
)
