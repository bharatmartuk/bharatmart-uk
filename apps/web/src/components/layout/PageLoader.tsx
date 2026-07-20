'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Full-screen logo preloader shown on first load and brief page transitions,
 * inspired by https://www.bharatmart.uk/
 */
export function PageLoader() {
  const pathname = usePathname()
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    setVisible(true)
    setFading(false)

    const fadeTimer = window.setTimeout(() => setFading(true), 700)
    const hideTimer = window.setTimeout(() => setVisible(false), 1100)

    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(hideTimer)
    }
  }, [pathname])

  if (!visible) return null

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#fff8f0] transition-opacity duration-300 ${
        fading ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      role="status"
    >
      <div className="flex flex-col items-center gap-4">
        <img
          alt="BharatMart"
          className="h-16 w-auto animate-pulse object-contain md:h-20"
          height={98}
          src="/bharatmart-logo.png"
          width={217}
        />
        <span className="sr-only">Loading</span>
      </div>
    </div>
  )
}
