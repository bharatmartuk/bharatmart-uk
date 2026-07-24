'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Trash2 } from 'lucide-react'
import { Button, Card, CardContent, toast } from '@bharatmart/ui'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { useWishlistStore } from '@/lib/store/wishlist-store'

const priceFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

export function WishlistPageClient() {
  const items = useWishlistStore((state) => state.items)
  const removeItem = useWishlistStore((state) => state.removeItem)

  if (items.length === 0) {
    return (
      <main className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center px-4 py-16 text-center">
        <h1 className="font-heading text-3xl font-semibold">Your favourites list is empty</h1>
        <p className="mt-2 text-[#514534]">Save products you love and come back to them anytime.</p>
        <Button asChild className="mt-6 bg-[#7f5700] text-white hover:bg-[#604100]">
          <Link href="/products">Browse products</Link>
        </Button>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 md:px-8 lg:px-16">
      <h1 className="font-heading text-3xl font-semibold">Favourites</h1>
      <p className="mt-1 text-sm text-[#514534]">
        {items.length} saved {items.length === 1 ? 'item' : 'items'}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card className="overflow-hidden border-[#d6c4ad] bg-white" key={item.productId}>
            <div className="relative aspect-[4/3] bg-[#f9f3ea]">
              {item.imageUrl ? (
                <Image
                  alt={item.name}
                  className="object-cover"
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  src={item.imageUrl}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#837561]">
                  Image coming soon
                </div>
              )}
              <button
                aria-label={`Remove ${item.name} from favourites`}
                className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-[#a83635] shadow-sm transition hover:bg-white"
                onClick={() => {
                  removeItem(item.productId)
                  toast.success(`Removed “${item.name}” from favourites`)
                }}
                type="button"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <CardContent className="space-y-3 p-4">
              <p className="truncate text-xs text-[#837561]">Sold by {item.merchantName}</p>
              <Link className="line-clamp-2 font-semibold hover:text-[#7f5700]" href={`/products/${item.slug}`}>
                {item.name}
              </Link>
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-[#a83635]">
                  {priceFormatter.format(item.priceInPence / 100)}
                </span>
                <AddToCartButton
                  className="bg-[#2e6a39] text-white hover:bg-[#135224]"
                  item={{
                    productId: item.productId,
                    slug: item.slug,
                    name: item.name,
                    imageUrl: item.imageUrl,
                    priceInPence: item.priceInPence,
                    stockQuantity: item.stockQuantity ?? 99,
                    merchantId: item.merchantId,
                    merchantName: item.merchantName,
                  }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  )
}
