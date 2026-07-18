'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Button } from '@bharatmart/ui'
import type { BannerSummary } from '@bharatmart/services'

export function HeroCarousel({ banners }: { banners: BannerSummary[] }) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (banners.length < 2) return
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % banners.length)
    }, 6000)
    return () => window.clearInterval(timer)
  }, [banners.length])

  if (banners.length === 0) {
    return (
      <section className="flex min-h-[360px] items-center bg-[#33302a] px-4 text-white md:min-h-[520px] md:px-16">
        <div className="mx-auto w-full max-w-7xl">
          <h1 className="max-w-xl font-heading text-4xl font-bold md:text-5xl">
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
    <section aria-label="Featured collections" className="relative h-[420px] overflow-hidden md:h-[520px]">
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
              src={banner.imageUrl}
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-transparent">
              <div className="mx-auto flex h-full max-w-7xl items-center px-4 md:px-8 lg:px-16">
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
        <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
          {banners.map((banner, index) => (
            <button
              aria-label={`Show banner ${index + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                activeIndex === index ? 'w-8 bg-[#e8a317]' : 'w-2.5 bg-white/60'
              }`}
              key={banner.id}
              onClick={() => setActiveIndex(index)}
              type="button"
            />
          ))}
        </div>
      ) : null}
    </section>
  )
}
