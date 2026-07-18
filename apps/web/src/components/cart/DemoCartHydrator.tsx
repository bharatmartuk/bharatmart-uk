'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useCartStore, type CartItem } from '@/lib/store/cart-store'

const DEMO_CUSTOMER_EMAIL = 'ananya.patel@bharatmart.uk'
const SEEDED_FLAG = 'bharatmart-demo-cart-seeded-v1'

/**
 * Cart lives in localStorage. After DB seed, hydrate a few items once for the
 * demo customer so the storefront shows an active cart.
 */
export function DemoCartHydrator() {
  const { data: session, status } = useSession()
  const items = useCartStore((state) => state.items)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    if (status !== 'authenticated') return
    if (session.user?.email?.toLowerCase() !== DEMO_CUSTOMER_EMAIL) return
    if (items.length > 0) return
    if (typeof window === 'undefined') return
    if (window.localStorage.getItem(SEEDED_FLAG) === '1') return

    let cancelled = false
    void fetch('/api/demo/cart')
      .then((res) => (res.ok ? res.json() : null))
      .then((payload: { items?: CartItem[] } | null) => {
        if (cancelled || !payload?.items?.length) return
        for (const item of payload.items) {
          addItem(
            {
              productId: item.productId,
              slug: item.slug,
              name: item.name,
              imageUrl: item.imageUrl,
              priceInPence: item.priceInPence,
              stockQuantity: item.stockQuantity,
              merchantId: item.merchantId,
              merchantName: item.merchantName,
            },
            item.quantity,
          )
        }
        window.localStorage.setItem(SEEDED_FLAG, '1')
      })
      .catch(() => {
        // Demo-only helper; ignore failures.
      })

    return () => {
      cancelled = true
    }
  }, [addItem, items.length, session?.user?.email, status])

  return null
}
