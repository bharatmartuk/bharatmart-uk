import Link from 'next/link'
import { Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@bharatmart/ui'
import type { FeaturedMerchant } from '@bharatmart/services'
import { MerchantLogo } from '@/components/merchant/MerchantLogo'

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
                <MerchantLogo
                  className="h-28 w-28 md:h-32 md:w-32"
                  sizes="(max-width: 768px) 112px, 128px"
                  storeLogoUrl={merchant.storeLogoUrl}
                  storeName={merchant.storeName}
                />
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
                <Link
                  aria-label={`Browse products from ${merchant.storeName}`}
                  className="mt-4 inline-flex h-8 w-full items-center justify-center rounded-md border border-[#a83635] bg-white px-3 text-xs font-medium text-[#a83635] transition-colors hover:bg-[#f9f3ea] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a83635]/40"
                  href={`/products?merchantId=${merchant.id}`}
                >
                  Visit Store
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
