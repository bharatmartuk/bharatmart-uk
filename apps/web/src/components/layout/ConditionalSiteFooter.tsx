'use client'

import { usePathname } from 'next/navigation'
import { SiteFooter } from '@/components/layout/SiteFooter'

/** Full site footer is only shown on the homepage landing page. */
export function ConditionalSiteFooter() {
  const pathname = usePathname()
  if (pathname !== '/') return null
  return <SiteFooter />
}
