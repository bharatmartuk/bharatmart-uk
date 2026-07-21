import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { WhatsAppFloat } from '@/components/layout/WhatsAppFloat'
import { PageLoader } from '@/components/layout/PageLoader'

export default function InfoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fff8f0] text-[#1e1b16]">
      <PageLoader />
      <SiteHeader />
      {children}
      <SiteFooter />
      <WhatsAppFloat />
    </div>
  )
}
