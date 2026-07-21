'use client'

import { useEffect, useState } from 'react'
import { cn } from '@bharatmart/utils'
import type { LegalSection } from '@/content/legal/types'

type LegalTocProps = {
  sections: LegalSection[]
  sidebarTitle: string
  lastUpdated: string
}

export function LegalToc({ sections, sidebarTitle, lastUpdated }: LegalTocProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? '')

  useEffect(() => {
    const elements = sections
      .map((section) => document.getElementById(section.id))
      .filter((el): el is HTMLElement => Boolean(el))

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        const top = visible[0]
        if (top?.target.id) {
          setActiveId(top.target.id)
        }
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: [0.1, 0.25, 0.5],
      },
    )

    for (const el of elements) observer.observe(el)
    return () => observer.disconnect()
  }, [sections])

  return (
    <aside className="hidden w-72 shrink-0 lg:block xl:w-80">
      <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto border-r border-[#d6c4ad] pr-4 pt-2">
        <div className="mb-6 px-4">
          <h2 className="font-heading text-xl font-semibold text-[#7f5700]">{sidebarTitle}</h2>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-[#837561]">
            Last updated {lastUpdated}
          </p>
        </div>
        <nav aria-label="Page sections" className="flex flex-col">
          {sections.map((section) => {
            const isActive = section.id === activeId
            return (
              <a
                className={cn(
                  'border-l-4 py-3 pl-4 text-sm transition-colors hover:bg-[#eee7de]',
                  isActive
                    ? 'border-[#7f5700] font-bold text-[#7f5700]'
                    : 'border-transparent text-[#514534]',
                )}
                href={`#${section.id}`}
                key={section.id}
              >
                {section.heading.replace(/^\d+\.\s*/, '')}
              </a>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}
