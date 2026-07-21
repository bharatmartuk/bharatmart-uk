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

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [banners, categories, merchants, newArrivals, featuredProducts] = await Promise.all([
    BannerService.getActiveBanners(),
    CategoryService.getTopLevelCategories(),
    MerchantService.getFeatured(5),
    ProductService.getNewArrivals(8),
    ProductService.getFeatured(8),
  ])

  return (
    <main>
      <HeroCarousel banners={banners} />
      <CategoryGrid categories={categories} />
      <ProductSection
        id="new-arrivals-heading"
        products={newArrivals}
        subtitle="Fresh listings from merchants across the UK"
        title="New Arrivals"
        viewAllHref="/products?sort=newest"
      />
      <ProductSection
        id="featured-products-heading"
        products={featuredProducts}
        subtitle="Curated picks our community loves"
        title="Featured Products"
      />
      <FeaturedMerchants merchants={merchants} />
      <TrustStrip />
    </main>
  )
}
