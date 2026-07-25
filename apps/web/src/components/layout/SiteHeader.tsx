import Link from 'next/link'
import { AuthService, CategoryService } from '@bharatmart/services'
import { CartLink } from '@/components/cart/CartLink'
import { CategoriesNav } from '@/components/layout/CategoriesNav'
import { HeaderAuthNav } from '@/components/layout/HeaderAuthNav'
import { HeaderSearch } from '@/components/layout/HeaderSearch'
import { MobileNav } from '@/components/layout/MobileNav'
import { MobileSearchSheet } from '@/components/layout/MobileSearchSheet'
import { WishlistLink } from '@/components/wishlist/WishlistLink'
import { LocationChip } from '@/components/location/LocationChip'
import { getCurrentUser } from '@/auth'
import { merchantAppPath } from '@/lib/app-urls'
import type { CustomerLocation } from '@/lib/customer-location-types'

export async function SiteHeader({ location }: { location?: CustomerLocation }) {
  const user = await getCurrentUser()
  const [profile, categories] = await Promise.all([
    user ? AuthService.getProfile(user.id) : Promise.resolve(null),
    CategoryService.getTopLevelCategories(),
  ])

  return (
    <header className="sticky top-0 z-50 isolate border-b border-black/5 bg-[#fff8f0] shadow-[0_4px_12px_rgba(0,0,0,0.04)] [background-color:#fff8f0]">
      <div className="flex h-16 w-full items-center gap-2 px-3 md:h-20 md:gap-3 md:px-4 lg:px-5">
        {/* Left: logo flush to the start */}
        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          <MobileNav categories={categories} isSignedIn={Boolean(user)} />
          <Link className="flex shrink-0 items-center justify-center bg-transparent" href="/">
            <img
              alt="BharatMart"
              src="/bharatmart-logo.png"
              className="block h-11 w-auto max-w-[132px] bg-transparent object-contain md:h-14 md:max-w-[160px]"
              width={217}
              height={98}
            />
          </Link>
          <CategoriesNav categories={categories} />
          {location ? <LocationChip location={location} /> : null}
        </div>

        {/* Centre: compact search */}
        <div className="mx-auto hidden min-w-0 flex-1 justify-center md:flex">
          <div className="w-full max-w-xs lg:max-w-sm">
            <HeaderSearch />
          </div>
        </div>

        {/* Right: account actions + Become a Seller as corner CTA */}
        <nav className="ml-auto flex shrink-0 items-center gap-1 md:gap-2">
          <MobileSearchSheet />
          <WishlistLink />
          <CartLink />
          <HeaderAuthNav displayName={profile?.name ?? null} isSignedIn={Boolean(user)} />
          {!user ? (
            <a
              className="ml-1 hidden h-9 items-center justify-center rounded-md bg-[#a83635] px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#8f2e2d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a83635]/40 lg:inline-flex"
              href={merchantAppPath('/login?intent=register')}
            >
              Become a Seller
            </a>
          ) : null}
        </nav>
      </div>
    </header>
  )
}
