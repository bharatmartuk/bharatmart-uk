'use client'

import Image from 'next/image'
import { useState } from 'react'
import { cn } from '@bharatmart/utils'
import { FavoriteButton } from '@/components/product/FavoriteButton'
import type { WishlistItem } from '@/lib/store/wishlist-store'

interface ProductImageGalleryProps {
  images: Array<{ id: string; url: string }>
  productName: string
  favorite?: WishlistItem
}

export function ProductImageGallery({ images, productName, favorite }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = images[activeIndex] ?? images[0]

  if (!active) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-xl bg-[#f4ede4] text-sm text-[#837561]">
        Image coming soon
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-xl bg-[#f9f3ea]">
        <Image
          alt={productName}
          className="object-cover"
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
          src={active.url}
          unoptimized
        />
        {favorite ? (
          <FavoriteButton className="absolute right-4 top-4 z-10" item={favorite} size="lg" />
        ) : null}
      </div>
      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {images.map((image, index) => (
            <button
              aria-label={`Show image ${index + 1}`}
              className={cn(
                'relative aspect-square overflow-hidden rounded-lg border-2',
                activeIndex === index ? 'border-[#7f5700]' : 'border-transparent',
              )}
              key={image.id}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              <Image alt="" className="object-cover" fill sizes="96px" src={image.url} unoptimized />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
