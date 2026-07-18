import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@bharatmart/ui'
import type { FeaturedMerchant } from '@bharatmart/services'

export function FeaturedMerchants({ merchants }: { merchants: FeaturedMerchant[] }) {
  if (merchants.length === 0) return null

  return (
    <section aria-labelledby="merchant-heading" className="bg-[#f4ede4] py-14 md:py-16">
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-16">
        <h2 className="mb-8 font-heading text-2xl font-semibold md:text-center md:text-3xl" id="merchant-heading">
          Top Rated Merchants
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {merchants.map((merchant) => (
            <Card className="border-0 bg-white text-center shadow-sm" key={merchant.id}>
              <CardHeader className="items-center pb-2">
                <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-[#eee7de] bg-white">
                  {merchant.storeLogoUrl ? (
                    <Image
                      alt={`${merchant.storeName} logo`}
                      className="object-cover"
                      fill
                      sizes="80px"
                      src={merchant.storeLogoUrl}
                    />
                  ) : null}
                </div>
                <CardTitle className="pt-2 text-lg">{merchant.storeName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-1 text-sm">
                  <Star className="h-4 w-4 fill-[#e8a317] text-[#e8a317]" />
                  <strong>{merchant.avgRating.toFixed(1)}</strong>
                  <span className="text-[#837561]">({merchant.productCount} items)</span>
                </div>
                <p className="mt-3 line-clamp-2 min-h-10 text-sm text-[#514534]">
                  {merchant.storeDescription || 'Authentic Indian products from a trusted UK seller.'}
                </p>
                <Button
                  asChild
                  className="mt-4 w-full border-[#a83635] text-[#a83635] hover:bg-[#a83635] hover:text-white"
                  size="sm"
                  variant="outline"
                >
                  <Link href={`/products?merchantId=${merchant.id}`}>Visit Store</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
