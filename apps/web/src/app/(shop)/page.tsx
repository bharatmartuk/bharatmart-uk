import {
  BannerService,
  CategoryService,
  MerchantService,
  ProductService,
} from '@bharatmart/services'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { FeaturedMerchants } from '@/components/home/FeaturedMerchants'
import { HeroCarousel } from '@/components/home/HeroCarousel'
import { ProductSection } from '@/components/home/ProductSection'
import { TrustStrip } from '@/components/home/TrustStrip'
import { getCustomerLocation } from '@/lib/customer-location'
import { getCurrentUser } from '@/auth'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const user = await getCurrentUser()
  const location = await getCustomerLocation(user?.id)
  const area = location.status === 'set' ? location.area ?? undefined : undefined

  const [banners, categories, merchants, newArrivals, featuredProducts] = await Promise.all([
    BannerService.getActiveBanners(),
    CategoryService.getTopLevelCategories(),
    MerchantService.getFeatured(5, area),
    ProductService.getNewArrivals(8, area),
    ProductService.getFeatured(8, area),
  ])

  const areaLabel = location.status === 'set' && location.postcode ? location.postcode : null

  return (
    <main>
      <HeroCarousel banners={banners} />
      <CategoryGrid categories={categories} />
      <ProductSection
        id="new-arrivals-heading"
        products={newArrivals}
        subtitle={
          areaLabel
            ? `Fresh listings that deliver to ${areaLabel}`
            : 'Fresh listings from merchants across the UK'
        }
        title="New Arrivals"
        viewAllHref={
          area && location.postcode
            ? `/products?sort=newest&postcode=${encodeURIComponent(location.postcode)}`
            : '/products?sort=newest'
        }
      />
      <ProductSection
        id="featured-products-heading"
        products={featuredProducts}
        subtitle={
          areaLabel
            ? `Curated picks available near ${areaLabel}`
            : 'Curated picks our community loves'
        }
        title="Featured Products"
      />
      <FeaturedMerchants
        merchants={merchants}
        title={areaLabel ? `Merchants near ${areaLabel}` : 'Top Rated Merchants'}
      />
      <TrustStrip />
    </main>
  )
}
