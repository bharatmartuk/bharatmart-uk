import type { CartItem } from '@/lib/store/cart-store'
import type { WishlistItem } from '@/lib/store/wishlist-store'

export type PendingAction =
  | { type: 'cart'; item: Omit<CartItem, 'quantity'>; quantity?: number }
  | { type: 'wishlist'; item: WishlistItem }

const STORAGE_KEY = 'bharatmart-pending-action'

export function setPendingAction(action: PendingAction) {
  if (typeof window === 'undefined') return
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(action))
}

export function consumePendingAction(): PendingAction | null {
  if (typeof window === 'undefined') return null
  const raw = window.sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  window.sessionStorage.removeItem(STORAGE_KEY)
  try {
    return JSON.parse(raw) as PendingAction
  } catch {
    return null
  }
}
