import Link from 'next/link'
import { Package, Settings, ShoppingBag, Store } from 'lucide-react'

const nav = [
  ['Overview', '/', Store],
  ['Products', '/products', Package],
  ['Orders', '/orders', ShoppingBag],
  ['Store settings', '/store-settings', Settings],
] as const

export function MerchantShell({
  children,
  storeName,
}: {
  children: React.ReactNode
  storeName?: string
}) {
  return (
    <div className="min-h-screen bg-[#fff8f0] text-[#1e1b16]">
      <header className="border-b border-[#d6c4ad] bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link className="font-semibold text-[#7f5700]" href="/">
            BharatMart Merchant
          </Link>
          <p className="text-sm text-[#514534]">{storeName ?? 'Merchant portal'}</p>
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
