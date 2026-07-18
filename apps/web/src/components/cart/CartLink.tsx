'use client'

import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart-store'

export function CartLink() {
  const count = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.quantity, 0),
  )

  return (
    <Link
      aria-label={`Shopping cart with ${count} items`}
      className="relative rounded-full p-2 text-[#7f5700] transition hover:bg-[#eee7de]"
      href="/cart"
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 ? (
        <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-[#a83635] px-1 text-center text-[10px] font-bold leading-4 text-white">
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </Link>
  )
}
