'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Flag,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  ShoppingBag,
  Store,
  X,
} from 'lucide-react'
import { cn } from '@bharatmart/utils'

const navGroups = [
  {
    label: 'Dashboard',
    items: [{ label: 'Overview', href: '/', icon: LayoutDashboard }],
  },
  {
    label: 'Marketplace',
    items: [
      { label: 'Merchants', href: '/merchants', icon: Store },
      { label: 'Marketplace', href: '/marketplace', icon: Flag },
      { label: 'Orders', href: '/orders', icon: ShoppingBag },
    ],
  },
  {
    label: 'Support',
    items: [{ label: 'Support', href: '/support-tickets', icon: LifeBuoy }],
  },
] as const

function isActivePath(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

function NavLinks({
  pathname,
  onNavigate,
}: {
  pathname: string
  onNavigate?: () => void
}) {
  return (
    <nav aria-label="Admin" className="space-y-5">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-[#837561]">
            {group.label}
          </p>
          <div className="space-y-1">
            {group.items.map((item) => {
              const active = isActivePath(pathname, item.href)
              const Icon = item.icon
              return (
                <Link
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                    active
                      ? 'bg-[#f4ede4] text-[#7f5700] shadow-sm'
                      : 'text-[#514534] hover:bg-[#f4ede4]/70 hover:text-[#7f5700]',
                  )}
                  href={item.href}
                  key={item.href}
                  {...(onNavigate ? { onClick: onNavigate } : {})}
                >
                  <Icon
                    className={cn('h-4 w-4', active ? 'text-[#7f5700]' : 'text-[#837561]')}
                  />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col bg-[#fff8f0] text-[#1e1b16]">
      <header className="sticky top-0 z-40 border-b border-[#d6c4ad]/80 bg-[#fff8f0]/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button
              aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d6c4ad] text-[#514534] transition hover:bg-[#f4ede4] md:hidden"
              onClick={() => setMobileOpen((open) => !open)}
              type="button"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <Link className="flex h-full items-center gap-2 font-semibold text-[#7f5700]" href="/">
              <img
                alt="BharatMart"
                className="h-10 w-auto object-contain object-center"
                height={98}
                src="/bharatmart-logo.png"
                width={217}
              />
              <span className="whitespace-nowrap">Admin</span>
            </Link>
          </div>
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

      {mobileOpen ? (
        <div className="border-b border-[#d6c4ad] bg-[#fff8f0] px-4 py-4 md:hidden">
          <NavLinks onNavigate={() => setMobileOpen(false)} pathname={pathname} />
        </div>
      ) : null}

      <div className="mx-auto grid w-full max-w-[1600px] flex-1 gap-6 px-4 py-6 md:grid-cols-[220px_minmax(0,1fr)] md:items-start md:px-8">
        <aside className="hidden md:sticky md:top-20 md:block md:self-start">
          <NavLinks pathname={pathname} />
        </aside>
        <div className="min-w-0 pb-8">{children}</div>
      </div>
    </div>
  )
}
