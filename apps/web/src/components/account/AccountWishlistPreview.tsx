'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@bharatmart/ui'
import { useWishlistStore } from '@/lib/store/wishlist-store'

const priceFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

export function AccountWishlistPreview() {
  const items = useWishlistStore((state) => state.items).slice(0, 4)

  return (
    <Card
      className="scroll-mt-28 rounded-2xl border-[#e8d9c8] bg-white shadow-sm"
      id="wishlist-preview"
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-6 pb-2">
        <div>
          <CardTitle className="text-xl font-semibold text-[#1e1b16]">Wishlist</CardTitle>
          <p className="mt-1 text-sm text-[#514534]">A quick look at your saved favourites.</p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/wishlist">View Wishlist</Link>
        </Button>
      </CardHeader>
      <CardContent className="p-6 pt-4">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#e8d9c8] bg-[#f9f3ea]/60 px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#a83635] shadow-sm">
              <Heart className="h-6 w-6" aria-hidden />
            </div>
            <p className="mt-4 text-lg font-semibold text-[#1e1b16]">No wishlist items</p>
            <p className="mt-1 max-w-sm text-sm text-[#514534]">
              Save products you love and revisit them anytime.
            </p>
            <Button asChild className="mt-5 bg-[#7f5700] text-white hover:bg-[#604100]">
              <Link href="/products">Browse products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <Link
                aria-label={`View ${item.name}`}
                className="group overflow-hidden rounded-2xl border border-[#f0e6d8] bg-[#fdfaf6] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                href={`/products/${item.slug}`}
                key={item.productId}
              >
                <div className="relative aspect-[4/3] bg-[#f4ede4]">
                  {item.imageUrl ? (
                    <Image
                      alt={item.name}
                      className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
                      src={item.imageUrl}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-[#837561]">
                      No image
                    </div>
                  )}
                </div>
                <div className="space-y-1 p-3">
                  <p className="line-clamp-2 text-sm font-semibold text-[#1e1b16]">{item.name}</p>
                  <p className="text-sm font-bold text-[#a83635]">
                    {priceFormatter.format(item.priceInPence / 100)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
