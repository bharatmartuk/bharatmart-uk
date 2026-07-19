import { BannerAdminService } from '@bharatmart/services'
import { BannerManager } from '@/components/banners/BannerManager'

export const dynamic = 'force-dynamic'

export default async function BannersPage() {
  const banners = await BannerAdminService.list()

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Homepage carousel</h1>
        <p className="text-sm text-[#514534]">
          Manage hero slides on the marketplace. Active slides within their date range rotate on
          the customer homepage.
        </p>
      </div>
      <BannerManager
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
      />
    </main>
  )
}
