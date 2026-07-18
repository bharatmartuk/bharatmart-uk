import {
  BannerService,
  CategoryService,
  MerchantService,
  ProductService,
} from '@bharatmart/services'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { FeaturedMerchants } from '@/components/home/FeaturedMerchants'
import { FestivalSection } from '@/components/home/FestivalSection'
import { HeroCarousel } from '@/components/home/HeroCarousel'
import { TrendingProducts } from '@/components/home/TrendingProducts'
import { TrustStrip } from '@/components/home/TrustStrip'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [banners, categories, merchants, products] = await Promise.all([
    BannerService.getActiveBanners(),
    CategoryService.getTopLevelCategories(),
    MerchantService.getFeatured(5),
    ProductService.getTrending(8),
  ])

  return (
    <main>
      <HeroCarousel banners={banners} />
      <CategoryGrid categories={categories} />
      <FestivalSection />
      <TrendingProducts products={products} />
      <FeaturedMerchants merchants={merchants} />
      <TrustStrip />
    </main>
  )
}
