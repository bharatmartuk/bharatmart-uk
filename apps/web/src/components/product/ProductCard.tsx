import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { Badge, Card, CardContent } from '@bharatmart/ui'
import type { ProductSummary } from '@bharatmart/services'
import { AddToCartButton } from '@/components/cart/AddToCartButton'
import { FavoriteButton } from '@/components/product/FavoriteButton'

const priceFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

export function ProductCard({ product }: { product: ProductSummary }) {
  return (
    <Card className="group overflow-hidden border-[#d6c4ad] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(46,21,21,0.08)]">
      <div className="relative aspect-square overflow-hidden bg-[#f9f3ea]">
        <Link
          aria-label={`View ${product.name}`}
          className="absolute inset-0 block"
          href={`/products/${product.slug}`}
        >
          {product.imageUrl ? (
            <Image
              alt={product.name}
              className="object-cover transition duration-500 group-hover:scale-105"
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              src={product.imageUrl}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[#837561]">
              Image coming soon
            </div>
          )}
        </Link>
        <FavoriteButton
          className="absolute right-3 top-3 z-10"
          item={{
            productId: product.id,
            slug: product.slug,
            name: product.name,
            imageUrl: product.imageUrl,
            priceInPence: product.priceInPence,
            merchantId: product.merchantId,
            merchantName: product.merchantName,
          }}
        />
        {product.reviewCount > 0 ? (
          <Badge className="absolute bottom-3 left-3 border-0 bg-white/90 text-[#514534]">
            <Star className="mr-1 h-3 w-3 fill-[#e8a317] text-[#e8a317]" />
            {product.avgRating.toFixed(1)}
          </Badge>
        ) : null}
      </div>
      <CardContent className="p-4">
        <p className="mb-1 truncate text-xs text-[#837561]">Sold by {product.merchantName}</p>
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-1 font-semibold text-[#1e1b16] hover:text-[#7f5700]">
            {product.name}
          </h3>
        </Link>
        <div className="mt-4 flex items-center justify-between gap-2">
          <span className="font-bold text-[#a83635]">
            {priceFormatter.format(product.priceInPence / 100)}
          </span>
          <AddToCartButton
            className="bg-[#2e6a39] text-white hover:bg-[#135224]"
            item={{
              productId: product.id,
              slug: product.slug,
              name: product.name,
              imageUrl: product.imageUrl,
              priceInPence: product.priceInPence,
              stockQuantity: product.stockQuantity,
              merchantId: product.merchantId,
              merchantName: product.merchantName,
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
