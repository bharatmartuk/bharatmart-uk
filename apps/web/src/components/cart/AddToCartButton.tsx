'use client'

import { ShoppingBag } from 'lucide-react'
import { Button, toast } from '@bharatmart/ui'
import { useCartStore, type CartItem } from '@/lib/store/cart-store'

interface AddToCartButtonProps {
  item: Omit<CartItem, 'quantity'>
  className?: string
  showIcon?: boolean
}

export function AddToCartButton({ item, className, showIcon = false }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem)

  function handleClick() {
    addItem(item)
    toast.success(`Added “${item.name}” to cart`)
  }

  return (
    <Button
      className={className}
      disabled={item.stockQuantity < 1}
      onClick={handleClick}
      size="sm"
      type="button"
    >
      {showIcon ? <ShoppingBag className="mr-2 h-4 w-4" /> : null}
      {item.stockQuantity > 0 ? 'Add to Cart' : 'Out of stock'}
    </Button>
  )
}
