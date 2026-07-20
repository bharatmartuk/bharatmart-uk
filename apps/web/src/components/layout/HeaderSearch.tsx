'use client'

import { useEffect, useId, useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@bharatmart/ui'
import { cn } from '@bharatmart/utils'

type SuggestItem = {
  id: string
  name: string
  slug: string
  priceInPence: number
  imageUrl: string | null
  merchantName: string
  categoryName: string
}

const priceFormatter = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
})

export function HeaderSearch({
  className,
  autoFocus = false,
  onNavigate,
}: {
  className?: string
  autoFocus?: boolean
  onNavigate?: () => void
}) {
  const router = useRouter()
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<SuggestItem[]>([])
  const [mode, setMode] = useState<'recommendations' | 'autocomplete'>('recommendations')
  const [activeIndex, setActiveIndex] = useState(-1)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      startTransition(async () => {
        try {
          const res = await fetch(
            `/api/search/suggest?q=${encodeURIComponent(query.trim())}&limit=8`,
            { signal: controller.signal },
          )
          if (!res.ok) return
          const data = (await res.json()) as {
            mode: 'recommendations' | 'autocomplete'
            items: SuggestItem[]
          }
          setItems(data.items)
          setMode(data.mode)
          setActiveIndex(-1)
        } catch {
          // ignore abort / network
        }
      })
    }, query.trim() ? 180 : 0)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [query])

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  function goToResults(value = query) {
    const trimmed = value.trim()
    setOpen(false)
    onNavigate?.()
    router.push(trimmed ? `/products?q=${encodeURIComponent(trimmed)}` : '/products')
  }

  function goToProduct(slug: string) {
    setOpen(false)
    onNavigate?.()
    router.push(`/products/${slug}`)
  }

  return (
    <div className={cn('relative w-full', className)} ref={rootRef}>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (activeIndex >= 0 && items[activeIndex]) {
            goToProduct(items[activeIndex].slug)
            return
          }
          goToResults()
        }}
      >
        <label className="relative block">
          <span className="sr-only">Search BharatMart</span>
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#514534]" />
          <Input
            autoComplete="off"
            autoFocus={autoFocus}
            className="h-11 rounded-xl border-[#d6c4ad] bg-[#f9f3ea] pl-11 pr-10 focus-visible:ring-[#e8a317]"
            name="q"
            onChange={(event) => {
              setQuery(event.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (!open || items.length === 0) return
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                setActiveIndex((index) => (index + 1) % items.length)
              } else if (event.key === 'ArrowUp') {
                event.preventDefault()
                setActiveIndex((index) => (index <= 0 ? items.length - 1 : index - 1))
              } else if (event.key === 'Escape') {
                setOpen(false)
              }
            }}
            placeholder="Search pickles, snacks, merchants..."
            role="combobox"
            aria-autocomplete="list"
            aria-controls={listId}
            aria-expanded={open}
            type="search"
            value={query}
          />
          {query ? (
            <button
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#837561] hover:bg-[#eee7de]"
              onClick={() => {
                setQuery('')
                setOpen(true)
              }}
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </label>
      </form>

      {open ? (
        <div
          className="absolute left-0 right-0 top-[calc(100%+0.4rem)] z-50 overflow-hidden rounded-xl border border-[#d6c4ad] bg-white shadow-[0_12px_32px_rgba(46,21,21,0.12)]"
          id={listId}
          role="listbox"
        >
          <div className="border-b border-[#eee7de] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#837561]">
            {mode === 'recommendations' ? 'Recommended products' : 'Suggestions'}
            {pending ? ' · searching…' : ''}
          </div>
          {items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-[#514534]">
              {query.trim()
                ? 'No matching products. Try a different spelling.'
                : 'No products available right now.'}
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {items.map((item, index) => (
                <li key={item.id}>
                  <button
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:bg-[#f9f3ea]',
                      activeIndex === index && 'bg-[#f9f3ea]',
                    )}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => goToProduct(item.slug)}
                    role="option"
                    aria-selected={activeIndex === index}
                    type="button"
                  >
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-[#f4ede4]">
                      {item.imageUrl ? (
                        <Image
                          alt=""
                          className="object-cover"
                          fill
                          sizes="44px"
                          src={item.imageUrl}
                          unoptimized
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[#1e1b16]">{item.name}</p>
                      <p className="truncate text-xs text-[#837561]">
                        {item.merchantName} · {item.categoryName}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-[#a83635]">
                      {priceFormatter.format(item.priceInPence / 100)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-[#eee7de] px-3 py-2">
            <button
              className="w-full rounded-lg px-2 py-2 text-left text-sm font-semibold text-[#7f5700] hover:bg-[#f9f3ea]"
              onClick={() => goToResults()}
              type="button"
            >
              {query.trim() ? `Search all results for “${query.trim()}”` : 'Browse all products'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
