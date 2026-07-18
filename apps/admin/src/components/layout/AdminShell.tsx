import Link from 'next/link'
import { Flag, FolderTree, LayoutDashboard, LifeBuoy, ShoppingBag, Store } from 'lucide-react'

const nav = [
  ['Overview', '/', LayoutDashboard],
  ['Merchants', '/merchants', Store],
  ['Categories', '/categories', FolderTree],
  ['Banners', '/banners', Flag],
  ['Orders', '/orders', ShoppingBag],
  ['Support', '/support-tickets', LifeBuoy],
] as const

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fff8f0] text-[#1e1b16]">
      <header className="border-b border-[#d6c4ad] bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 md:px-8">
          <Link className="font-semibold text-[#7f5700]" href="/">
            BharatMart Admin
          </Link>
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[220px_minmax(0,1fr)] md:px-8">
        <aside className="space-y-1">
          {nav.map(([label, href, Icon]) => (
            <Link
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-[#514534] hover:bg-[#f4ede4] hover:text-[#7f5700]"
              href={href}
              key={href}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </aside>
        <div>{children}</div>
      </div>
    </div>
  )
}
