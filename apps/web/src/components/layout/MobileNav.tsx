'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Heart, Home, Menu, Package, ShoppingCart, UserCircle } from 'lucide-react'
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@bharatmart/ui'
import { cn } from '@bharatmart/utils'
import { merchantAppPath } from '@/lib/app-urls'

const links = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/products', label: 'All products', icon: Package },
  { href: '/products?category=homemade-pickles', label: 'Homemade Pickles', icon: Package },
  { href: '/products?category=homemade-snacks', label: 'Homemade Snacks', icon: Package },
  { href: '/wishlist', label: 'Favourites', icon: Heart },
  { href: '/cart', label: 'Cart', icon: ShoppingCart },
] as const

export function MobileNav({ isSignedIn }: { isSignedIn: boolean }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button aria-label="Open navigation" className="md:hidden" size="icon" variant="ghost">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[280px] border-[#d6c4ad] bg-[#fff8f0] p-0" side="left">
        <SheetHeader className="border-b border-[#d6c4ad] px-6 py-5 text-left">
          <SheetTitle className="font-heading text-xl text-[#7f5700]">Menu</SheetTitle>
        </SheetHeader>
        <nav aria-label="Mobile navigation" className="flex flex-col px-3 py-4">
          {links.map(({ href, label, icon: Icon }) => {
            const pathOnly = href.split('?')[0] ?? href
            const active = href === '/' ? pathname === '/' : pathname === pathOnly
            return (
              <Link
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition',
                  active
                    ? 'bg-[#f4ede4] text-[#7f5700]'
                    : 'text-[#514534] hover:bg-[#f4ede4] hover:text-[#7f5700]',
                )}
                href={href}
                key={href}
                onClick={() => setOpen(false)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            )
          })}
          <div className="my-3 border-t border-[#d6c4ad]" />
          {isSignedIn ? (
            <Link
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[#514534] transition hover:bg-[#f4ede4] hover:text-[#7f5700]"
              href="/account"
              onClick={() => setOpen(false)}
            >
              <UserCircle className="h-4 w-4" />
              My account
            </Link>
          ) : (
            <>
              <Link
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[#514534] transition hover:bg-[#f4ede4] hover:text-[#7f5700]"
                href="/login"
                onClick={() => setOpen(false)}
              >
                <UserCircle className="h-4 w-4" />
                Sign in
              </Link>
              <Link
                className="mt-2 flex items-center justify-center rounded-lg bg-[#7f5700] px-3 py-3 text-sm font-semibold text-white transition hover:bg-[#604100]"
                href="/register"
                onClick={() => setOpen(false)}
              >
                Sign up
              </Link>
            </>
          )}
          <a
            className="mt-4 px-3 text-xs font-medium text-[#837561] hover:text-[#7f5700]"
            href={merchantAppPath('/register-business')}
          >
            Become a seller
          </a>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
