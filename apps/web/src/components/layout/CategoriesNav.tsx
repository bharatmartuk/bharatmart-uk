'use client'

import Link from 'next/link'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@bharatmart/utils'
import type { CategorySummary } from '@bharatmart/services'

export function CategoriesNav({ categories }: { categories: CategorySummary[] }) {
  const [open, setOpen] = useState(false)

  if (categories.length === 0) return null

  return (
    <div
      className="relative hidden lg:block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        aria-expanded={open}
        className="inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1.5 text-sm font-semibold text-[#514534] transition hover:bg-[#f4ede4] hover:text-[#7f5700]"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        Categories
        <ChevronDown className={cn('h-4 w-4 transition', open && 'rotate-180')} />
      </button>

      {open ? (
        <div className="absolute left-0 top-full z-50 min-w-[240px] pt-2">
          <ul className="rounded-xl border border-[#d6c4ad] bg-white py-2 shadow-[0_12px_32px_rgba(0,0,0,0.08)]">
            {categories.map((category) => (
              <li key={category.id}>
                {category.comingSoon ? (
                  <span className="flex cursor-default items-center justify-between gap-3 px-4 py-2.5 text-sm text-[#837561]">
                    {category.name}
                    <span className="rounded-full bg-[#eee7de] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#7f5700]">
                      Coming soon
                    </span>
                  </span>
                ) : (
                  <Link
                    className="block px-4 py-2.5 text-sm text-[#514534] transition hover:bg-[#fff8f0] hover:text-[#7f5700]"
                    href={`/products?category=${category.slug}`}
                    onClick={() => setOpen(false)}
                  >
                    {category.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
