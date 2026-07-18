'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  productId: string
  slug: string
  name: string
  imageUrl: string | null
  priceInPence: number
  quantity: number
  stockQuantity: number
  merchantId: string
  merchantName: string
}

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((entry) => entry.productId === item.productId)
          if (!existing) {
            return { items: [...state.items, { ...item, quantity: Math.min(quantity, item.stockQuantity) }] }
          }

          return {
            items: state.items.map((entry) =>
              entry.productId === item.productId
                ? { ...entry, quantity: Math.min(entry.quantity + quantity, entry.stockQuantity) }
                : entry,
            ),
          }
        }),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items
            .map((item) =>
              item.productId === productId
                ? { ...item, quantity: Math.min(Math.max(quantity, 0), item.stockQuantity) }
                : item,
            )
            .filter((item) => item.quantity > 0),
        })),
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
      clearCart: () => set({ items: [] }),
    }),
    { name: 'bharatmart-cart' },
  ),
)
