'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Flag, LayoutDashboard, LifeBuoy, LogOut, ShoppingBag, Store } from 'lucide-react'
import { cn } from '@bharatmart/utils'

const nav = [
  ['Overview', '/', LayoutDashboard],
  ['Merchants', '/merchants', Store],
  ['Marketplace', '/marketplace', Flag],
  ['Orders', '/orders', ShoppingBag],
  ['Support', '/support-tickets', LifeBuoy],
] as const

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen flex-col bg-[#fff8f0] text-[#1e1b16]">
      <header className="sticky top-0 z-40 border-b border-[#d6c4ad] bg-[#fff8f0]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
          <Link className="flex h-full items-center gap-2 font-semibold text-[#7f5700]" href="/">
            <img
              alt="BharatMart"
              src="/bharatmart-logo.png"
              className="h-10 w-auto object-contain object-center"
              width={217}
              height={98}
            />
            <span className="whitespace-nowrap">Admin</span>
          </Link>
          <button
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#d6c4ad] px-3 py-1.5 text-sm font-medium text-[#514534] transition hover:border-[#7f5700] hover:bg-[#f4ede4] hover:text-[#7f5700]"
            onClick={() => void signOut({ callbackUrl: '/login' })}
            type="button"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log out
          </button>
        </div>
      </header>
      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-6 px-4 py-6 md:grid-cols-[220px_minmax(0,1fr)] md:items-start md:px-8">
        <aside className="md:sticky md:top-20 md:self-start">
          <nav aria-label="Admin" className="space-y-1">
            {nav.map(([label, href, Icon]) => {
              const active = isActivePath(pathname, href)
              return (
                <Link
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
                    active
                      ? 'bg-[#f4ede4] text-[#7f5700] shadow-[inset_3px_0_0_0_#7f5700]'
                      : 'text-[#514534] hover:bg-[#f4ede4] hover:text-[#7f5700]',
                  )}
                  href={href}
                  key={href}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              )
            })}
          </nav>
        </aside>
        <div className="min-w-0 pb-8">{children}</div>
      </div>
    </div>
  )
}
