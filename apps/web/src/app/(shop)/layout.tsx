import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { DemoCartHydrator } from '@/components/cart/DemoCartHydrator'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fff8f0] text-[#1e1b16]">
      <DemoCartHydrator />
      <SiteHeader />
      {children}
      <SiteFooter />
    </div>
  )
}
