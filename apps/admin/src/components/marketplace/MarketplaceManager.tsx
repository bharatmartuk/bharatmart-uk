'use client'

import { useSearchParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@bharatmart/ui'
import { CategorySortableList } from '@/components/categories/CategorySortableList'
import { BannerManager } from '@/components/banners/BannerManager'

type MarketplaceCategory = {
  id: string
  name: string
  slug: string
  isActive: boolean
  comingSoon: boolean
  parent: { id: string; name: string } | null
  _count: { products: number; children: number }
}

type MarketplaceBanner = {
  id: string
  imageUrl: string
  headline: string
  subtext: string | null
  ctaText: string | null
  ctaLink: string | null
  isActive: boolean
  startDate: string
  endDate: string
  sortOrder: number
}

export function MarketplaceManager({
  categories,
  banners,
}: {
  categories: MarketplaceCategory[]
  banners: MarketplaceBanner[]
}) {
  const searchParams = useSearchParams()
  const activeTab = searchParams.get('tab') === 'carousel' ? 'carousel' : 'categories'

  return (
    <Tabs defaultValue={activeTab} key={activeTab}>
      <TabsList className="bg-[#f4ede4]">
        <TabsTrigger value="categories">Categories</TabsTrigger>
        <TabsTrigger value="carousel">Homepage carousel</TabsTrigger>
      </TabsList>
      <TabsContent className="mt-6" value="categories">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-[#1e1b16]">Shop categories</h2>
          <p className="text-sm text-[#514534]">
            Add, reorder, and edit marketplace categories. Icons are assigned automatically.
            Coming-soon categories appear in the corner on the storefront.
          </p>
        </div>
        <CategorySortableList categories={categories} />
      </TabsContent>
      <TabsContent className="mt-6" value="carousel">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-[#1e1b16]">Homepage carousel</h2>
          <p className="text-sm text-[#514534]">
            Manage hero slides on the marketplace. Active slides within their date range rotate on
            the customer homepage.
          </p>
        </div>
        <BannerManager banners={banners} />
      </TabsContent>
    </Tabs>
  )
}
