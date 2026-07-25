import Link from 'next/link'
import { ArrowUpRight, Heart, Lock, MapPin, Package } from 'lucide-react'
import { cn } from '@bharatmart/utils'

const actions = [
  {
    href: '#recent-orders',
    title: 'Orders',
    description: 'Track purchases and invoices',
    icon: Package,
  },
  {
    href: '#wishlist-preview',
    title: 'Wishlist',
    description: 'Saved items you love',
    icon: Heart,
  },
  {
    href: '#saved-addresses',
    title: 'Saved Addresses',
    description: 'Delivery locations for checkout',
    icon: MapPin,
  },
  {
    href: '#account-security',
    title: 'Account Security',
    description: 'Password and login protection',
    icon: Lock,
  },
] as const

export function AccountQuickActions() {
  return (
    <section aria-label="Quick account actions" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Link
            aria-label={`${action.title}: ${action.description}`}
            className={cn(
              'group flex items-start justify-between gap-3 rounded-2xl border border-[#e8d9c8] bg-white p-6 shadow-sm',
              'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7f5700]/40',
            )}
            href={action.href}
            key={action.href}
          >
            <div className="space-y-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f9f3ea] text-[#7f5700]">
                <Icon className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#1e1b16]">{action.title}</h2>
                <p className="mt-1 text-sm text-[#514534]">{action.description}</p>
              </div>
            </div>
            <ArrowUpRight
              aria-hidden
              className="mt-1 h-4 w-4 shrink-0 text-[#837561] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[#7f5700]"
            />
          </Link>
        )
      })}
    </section>
  )
}
