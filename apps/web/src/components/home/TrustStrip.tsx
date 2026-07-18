import { LockKeyhole, ShieldCheck, Truck } from 'lucide-react'
import { Card } from '@bharatmart/ui'

const benefits = [
  [ShieldCheck, 'Verified Merchants', 'Direct from trusted Indian brands.'],
  [Truck, 'UK-Wide Delivery', 'Express delivery to your doorstep.'],
  [LockKeyhole, 'Secure Checkout', 'Safe and protected online payments.'],
] as const

export function TrustStrip() {
  return (
    <section aria-label="Why shop with BharatMart" className="mx-auto max-w-7xl px-4 py-12 md:px-8 lg:px-16">
      <div className="grid gap-5 border-y border-[#d6c4ad] py-8 md:grid-cols-3">
        {benefits.map(([Icon, title, description]) => (
          <div className="flex items-center gap-4" key={title}>
            <Card className="flex h-14 w-14 shrink-0 items-center justify-center border-0 bg-[#f4ede4] shadow-none">
              <Icon className="h-7 w-7 text-[#7f5700]" />
            </Card>
            <div>
              <h2 className="font-semibold">{title}</h2>
              <p className="text-sm text-[#514534]">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
