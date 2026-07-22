import { Suspense } from 'react'
import { BannerAdminService, CategoryAdminService } from '@bharatmart/services'
import { MarketplaceManager } from '@/components/marketplace/MarketplaceManager'

export const dynamic = 'force-dynamic'

export default async function MarketplacePage() {
  const [categories, banners] = await Promise.all([
    CategoryAdminService.list(),
    BannerAdminService.list(),
  ])

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Marketplace</h1>
        <p className="text-sm text-[#514534]">
          Edit storefront categories and the homepage carousel from one place.
        </p>
      </div>
      <Suspense fallback={null}>
        <MarketplaceManager
          banners={banners.map((banner) => ({
            id: banner.id,
            imageUrl: banner.imageUrl,
            headline: banner.headline,
            subtext: banner.subtext,
            ctaText: banner.ctaText,
            ctaLink: banner.ctaLink,
            isActive: banner.isActive,
            startDate: banner.startDate.toISOString(),
            endDate: banner.endDate.toISOString(),
            sortOrder: banner.sortOrder,
          }))}
          categories={categories}
        />
      </Suspense>
    </main>
  )
}
