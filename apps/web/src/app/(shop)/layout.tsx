import { SiteHeader } from '@/components/layout/SiteHeader'
import { ConditionalSiteFooter } from '@/components/layout/ConditionalSiteFooter'
import { ConditionalWhatsAppFloat } from '@/components/layout/ConditionalWhatsAppFloat'
import { DemoCartHydrator } from '@/components/cart/DemoCartHydrator'
import { PendingActionHydrator } from '@/components/cart/PendingActionHydrator'
import { PostcodeGate } from '@/components/location/PostcodeGate'
import { PostcodeBanner } from '@/components/location/PostcodeBanner'
import { getCustomerLocation } from '@/lib/customer-location'
import { getCurrentUser } from '@/auth'

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  const location = await getCustomerLocation(user?.id)

  // The modal gate is for first-time guests only. The informational banner
  // remains visible for any shopper who has not provided a delivery postcode.
  const showGate = !user && location.status === 'unknown'
  const showBanner = location.status !== 'set'

  return (
    <div className="min-h-screen bg-[#fff8f0] text-[#1e1b16]">
      <DemoCartHydrator />
      <PendingActionHydrator />
      {showGate ? <PostcodeGate openOnMount /> : null}
      <SiteHeader location={location} />
      {showBanner ? <PostcodeBanner location={location} /> : null}
      {children}
      <ConditionalSiteFooter />
      <ConditionalWhatsAppFloat />
    </div>
  )
}
