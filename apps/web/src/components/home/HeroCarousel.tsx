'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@bharatmart/ui'
import type { BannerSummary } from '@bharatmart/services'

const AUTO_SLIDE_MS = 6000

function carouselImageSrc(url: string) {
  try {
    if (url.startsWith('/')) return url
    const parsed = new URL(url)
    if (
      parsed.hostname === 'bharatmart-uk.vercel.app' ||
      parsed.hostname.endsWith('.vercel.app')
    ) {
      return `${parsed.pathname}${parsed.search}`
    }
  } catch {
    // keep original
  }
  return url
}

export function HeroCarousel({ banners }: { banners: BannerSummary[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const goTo = useCallback(
    (index: number) => {
      if (banners.length === 0) return
      const next = ((index % banners.length) + banners.length) % banners.length
      setActiveIndex(next)
    },
    [banners.length],
  )

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])

  useEffect(() => {
    if (banners.length < 2 || isPaused) return
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length)
    }, AUTO_SLIDE_MS)
    return () => window.clearInterval(timer)
  }, [banners.length, isPaused, activeIndex])

  if (banners.length === 0) {
    return (
      <section className="flex min-h-[360px] items-center bg-[#33302a] pl-[2cm] pr-3 text-white md:min-h-[520px] md:pl-[2.2cm] md:pr-5 lg:pr-6">
        <div className="w-full max-w-xl">
          <h1 className="font-heading text-4xl font-bold md:text-5xl">
            The best of India, delivered across the UK
          </h1>
          <Button asChild className="mt-7 bg-[#e8a317] text-[#281900] hover:bg-[#ffba3e]">
            <Link href="/products">Shop now</Link>
          </Button>
        </div>
      </section>
    )
  }

  return (
    <section
      aria-label="Featured collections"
      className="group/carousel relative h-[420px] overflow-hidden md:h-[520px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchEnd={(event) => {
        const start = touchStartX.current
        touchStartX.current = null
        if (start == null || banners.length < 2) return
        const delta = event.changedTouches[0]?.clientX ?? start
        const diff = delta - start
        if (Math.abs(diff) < 48) return
        if (diff < 0) goNext()
        else goPrev()
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null
        setIsPaused(true)
      }}
    >
      <div
        className="flex h-full transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${activeIndex * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <article className="relative h-full min-w-full" key={banner.id}>
            <Image
              alt=""
              className="object-cover"
              fill
              priority={index === 0}
              sizes="100vw"
              src={carouselImageSrc(banner.imageUrl)}
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent">
              <div className="flex h-full items-center pl-[2cm] pr-3 md:pl-[2.2cm] md:pr-5 lg:pr-6">
                <div className="max-w-xl text-white">
                  <h1 className="font-heading text-4xl font-bold leading-tight md:text-5xl">
                    {banner.headline}
                  </h1>
                  {banner.subtext ? (
                    <p className="mt-4 max-w-lg text-base leading-6 text-white/90 md:text-lg">
                      {banner.subtext}
                    </p>
                  ) : null}
                  {banner.ctaLink && banner.ctaText ? (
                    <Button
                      asChild
                      className="mt-7 h-12 bg-[#e8a317] px-8 font-bold text-[#281900] hover:bg-[#ffba3e]"
                    >
                      <Link href={banner.ctaLink}>{banner.ctaText}</Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {banners.length > 1 ? (
        <>
          <button
            aria-label="Previous banner"
            className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white opacity-100 backdrop-blur-sm transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a317] md:opacity-0 md:group-hover/carousel:opacity-100 md:left-6"
            onClick={() => {
              setIsPaused(true)
              goPrev()
            }}
            type="button"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            aria-label="Next banner"
            className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white opacity-100 backdrop-blur-sm transition hover:bg-black/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8a317] md:opacity-0 md:group-hover/carousel:opacity-100 md:right-6"
            onClick={() => {
              setIsPaused(true)
              goNext()
            }}
            type="button"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
            {banners.map((banner, index) => (
              <button
                aria-label={`Show banner ${index + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  activeIndex === index ? 'w-8 bg-[#e8a317]' : 'w-2.5 bg-white/60'
                }`}
                key={banner.id}
                onClick={() => {
                  setIsPaused(true)
                  setActiveIndex(index)
                }}
                type="button"
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  )
}
