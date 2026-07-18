import Link from 'next/link'
import { Menu, Search } from 'lucide-react'
import { Button, Input } from '@bharatmart/ui'
import { AuthService } from '@bharatmart/services'
import { CartLink } from '@/components/cart/CartLink'
import { HeaderAuthNav } from '@/components/layout/HeaderAuthNav'
import { getCurrentUser } from '@/auth'

export async function SiteHeader() {
  const user = await getCurrentUser()
  const profile = user ? await AuthService.getProfile(user.id) : null

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-[#fff8f0]/95 shadow-[0_4px_12px_rgba(0,0,0,0.04)] backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 md:h-20 md:px-8 lg:px-16">
        <Button
          aria-label="Open navigation"
          className="md:hidden"
          size="icon"
          variant="ghost"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Link
          className="shrink-0 font-heading text-lg font-bold text-[#7f5700] md:text-2xl"
          href="/"
        >
          BharatMart UK
        </Link>

        <form action="/products" className="mx-auto hidden w-full max-w-2xl md:block">
          <label className="relative block">
            <span className="sr-only">Search BharatMart</span>
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#514534]" />
            <Input
              className="h-11 rounded-xl border-[#d6c4ad] bg-[#f9f3ea] pl-11 focus-visible:ring-[#e8a317]"
              name="q"
              placeholder="Search for pooja items, groceries, sweets, sarees..."
              type="search"
            />
          </label>
        </form>

        <nav className="ml-auto flex shrink-0 items-center gap-1 md:gap-3">
          <Link
            className="hidden text-xs font-medium text-[#514534] transition hover:text-[#7f5700] lg:block"
            href="http://localhost:3001/login"
          >
            Become a Seller
          </Link>
          <Button aria-label="Search" className="md:hidden" size="icon" variant="ghost">
            <Search className="h-5 w-5 text-[#7f5700]" />
          </Button>
          <CartLink />
          <HeaderAuthNav displayName={profile?.name ?? null} isSignedIn={Boolean(user)} />
        </nav>
      </div>
    </header>
  )
}
