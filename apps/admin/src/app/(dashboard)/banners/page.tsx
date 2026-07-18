import { BannerAdminService } from '@bharatmart/services'
import { BannerManager } from '@/components/banners/BannerManager'

export const dynamic = 'force-dynamic'

export default async function BannersPage() {
  const banners = await BannerAdminService.list()

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Banners</h1>
        <p className="text-sm text-[#514534]">
          Date ranges feed Homepage BannerService.getActiveBanners().
        </p>
      </div>
      <BannerManager
        banners={banners.map((banner) => ({
          id: banner.id,
          headline: banner.headline,
          subtext: banner.subtext,
          isActive: banner.isActive,
          startDate: banner.startDate.toISOString(),
          endDate: banner.endDate.toISOString(),
        }))}
      />
    </main>
  )
}
