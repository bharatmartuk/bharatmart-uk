import Link from 'next/link'
import { AuthService, CategoryService } from '@bharatmart/services'
import { CartLink } from '@/components/cart/CartLink'
import { CategoriesNav } from '@/components/layout/CategoriesNav'
import { HeaderAuthNav } from '@/components/layout/HeaderAuthNav'
import { HeaderSearch } from '@/components/layout/HeaderSearch'
import { MobileNav } from '@/components/layout/MobileNav'
import { MobileSearchSheet } from '@/components/layout/MobileSearchSheet'
import { WishlistLink } from '@/components/wishlist/WishlistLink'
import { getCurrentUser } from '@/auth'
import { merchantAppPath } from '@/lib/app-urls'

export async function SiteHeader() {
  const user = await getCurrentUser()
  const [profile, categories] = await Promise.all([
    user ? AuthService.getProfile(user.id) : Promise.resolve(null),
    CategoryService.getTopLevelCategories(),
  ])

  return (
    <header className="sticky top-0 z-50 isolate border-b border-black/5 bg-[#fff8f0] shadow-[0_4px_12px_rgba(0,0,0,0.04)] [background-color:#fff8f0]">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:h-20 md:px-8 lg:px-16">
        <MobileNav categories={categories} isSignedIn={Boolean(user)} />
        <Link className="flex shrink-0 items-center justify-center bg-transparent" href="/">
          <img
            alt="BharatMart"
            src="/bharatmart-logo.png"
            className="block h-11 w-auto max-w-[140px] bg-transparent object-contain md:h-14 md:max-w-[170px]"
            width={217}
            height={98}
          />
        </Link>

        <CategoriesNav categories={categories} />

        <div className="mx-auto hidden w-full max-w-2xl md:block">
          <HeaderSearch />
        </div>

        <nav className="ml-auto flex shrink-0 items-center gap-1 md:gap-3">
          <a
            className="hidden text-xs font-medium text-[#514534] transition hover:text-[#7f5700] lg:block"
            href={merchantAppPath('/register-business')}
          >
            Become a Seller
          </a>
          <MobileSearchSheet />
          <WishlistLink />
          {user ? <CartLink /> : null}
          <HeaderAuthNav displayName={profile?.name ?? null} isSignedIn={Boolean(user)} />
        </nav>
      </div>
    </header>
  )
}
