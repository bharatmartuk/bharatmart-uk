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
  const hasPostcode = Boolean(areaLabel)

  const newArrivalsSection = (
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
  )

  const featuredSection = (
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
  )

  return (
    <main>
      {/* Without a postcode, lead with products so shoppers can browse immediately. */}
      {!hasPostcode ? (
        <>
          {newArrivalsSection}
          {featuredSection}
          <HeroCarousel banners={banners} />
          <CategoryGrid categories={categories} />
          <FeaturedMerchants
            merchants={merchants}
            title="Top Rated Merchants"
          />
          <TrustStrip />
        </>
      ) : (
        <>
          <HeroCarousel banners={banners} />
          <CategoryGrid categories={categories} />
          {newArrivalsSection}
          {featuredSection}
          <FeaturedMerchants
            merchants={merchants}
            title={`Merchants near ${areaLabel}`}
          />
          <TrustStrip />
        </>
      )}
    </main>
  )
}
