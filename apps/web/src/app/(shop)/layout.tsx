import { SiteHeader } from '@/components/layout/SiteHeader'
import { PageLoader } from '@/components/layout/PageLoader'
import { ConditionalSiteFooter } from '@/components/layout/ConditionalSiteFooter'
import { ConditionalWhatsAppFloat } from '@/components/layout/ConditionalWhatsAppFloat'
import { DemoCartHydrator } from '@/components/cart/DemoCartHydrator'
import { PendingActionHydrator } from '@/components/cart/PendingActionHydrator'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fff8f0] text-[#1e1b16]">
      <PageLoader />
      <DemoCartHydrator />
      <PendingActionHydrator />
      <SiteHeader />
      {children}
      <ConditionalSiteFooter />
      <ConditionalWhatsAppFloat />
    </div>
  )
}
