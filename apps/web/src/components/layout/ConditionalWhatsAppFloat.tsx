'use client'

import { usePathname } from 'next/navigation'
import { WhatsAppFloat } from '@/components/layout/WhatsAppFloat'

/** Floating WhatsApp CTA is only shown on the marketplace landing page. */
export function ConditionalWhatsAppFloat() {
  const pathname = usePathname()
  if (pathname !== '/') return null
  return <WhatsAppFloat />
}
