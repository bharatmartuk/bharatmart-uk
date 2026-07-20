'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { MapPin, Star } from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Input,
  Label,
  Slider,
  Switch,
} from '@bharatmart/ui'

type MerchantOption = {
  id: string
  storeName: string
}

type CategoryOption = {
  id: string
  name: string
  slug: string
}

interface ProductFiltersProps {
  merchants: MerchantOption[]
  categories: CategoryOption[]
  /** When used inside the mobile sheet, drop the outer card chrome. */
  variant?: 'card' | 'sheet'
}

const MAX_PRICE_POUNDS = 200

function parseNumber(value: string | null) {
  if (!value) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export function ProductFilters({ merchants, categories, variant = 'card' }: ProductFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const isSheet = variant === 'sheet'

  const minPricePence = parseNumber(searchParams.get('minPrice')) ?? 0
  const maxPricePence = parseNumber(searchParams.get('maxPrice')) ?? MAX_PRICE_POUNDS * 100
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Math.round(minPricePence / 100),
    Math.round(maxPricePence / 100),
  ])

  useEffect(() => {
    setPriceRange([
      Math.round((parseNumber(searchParams.get('minPrice')) ?? 0) / 100),
      Math.round((parseNumber(searchParams.get('maxPrice')) ?? MAX_PRICE_POUNDS * 100) / 100),
    ])
  }, [searchParams])

  const selectedMerchantId = searchParams.get('merchantId') ?? ''
  const selectedCategory = searchParams.get('category') ?? ''
  const selectedMinRating = parseNumber(searchParams.get('minRating'))
  const inStockOnly = searchParams.get('inStock') === '1'

  const paramsSnapshot = useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams])

  function pushParams(mutate: (params: URLSearchParams) => void) {
    const next = new URLSearchParams(paramsSnapshot.toString())
    mutate(next)
    next.delete('page')
    startTransition(() => {
      const query = next.toString()
      router.push(query ? `${pathname}?${query}` : pathname)
    })
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const currentMin = Math.round((parseNumber(searchParams.get('minPrice')) ?? 0) / 100)
      const currentMax = Math.round(
        (parseNumber(searchParams.get('maxPrice')) ?? MAX_PRICE_POUNDS * 100) / 100,
      )
      if (currentMin === priceRange[0] && currentMax === priceRange[1]) return

      pushParams((params) => {
        if (priceRange[0] <= 0) params.delete('minPrice')
        else params.set('minPrice', String(priceRange[0] * 100))

        if (priceRange[1] >= MAX_PRICE_POUNDS) params.delete('maxPrice')
        else params.set('maxPrice', String(priceRange[1] * 100))
      })
    }, 350)

    return () => window.clearTimeout(timer)
    // Intentionally debounce only price changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceRange])

  const body = (
      <>
        {!isSheet ? (
          <div className="mb-6">
            <h2 className="font-heading text-2xl text-[#1e1b16]">Filters</h2>
            <p className="text-sm text-[#837561]">Refine your search</p>
          </div>
        ) : null}
        <div className="space-y-7">
        <div className="space-y-2">
          <Label htmlFor="postcode">Delivery</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#837561]" />
            <Input
              className="pl-9"
              defaultValue={searchParams.get('postcode') ?? ''}
              id="postcode"
              onBlur={(event) =>
                pushParams((params) => {
                  if (event.target.value.trim()) params.set('postcode', event.target.value.trim())
                  else params.delete('postcode')
                })
              }
              placeholder="Enter postcode"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Price range</Label>
          <Slider
            max={MAX_PRICE_POUNDS}
            min={0}
            onValueChange={(value) => setPriceRange([value[0] ?? 0, value[1] ?? MAX_PRICE_POUNDS])}
            step={1}
            value={priceRange}
          />
          <div className="flex justify-between text-xs text-[#837561]">
            <span>£{priceRange[0]}</span>
            <span>£{priceRange[1]}{priceRange[1] >= MAX_PRICE_POUNDS ? '+' : ''}</span>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Category</Label>
          <div className="space-y-2">
            {categories.map((category) => {
              const checked = selectedCategory === category.slug
              return (
                <label className="flex items-center gap-2 text-sm" key={category.id}>
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) =>
                      pushParams((params) => {
                        if (value === true) params.set('category', category.slug)
                        else if (checked) params.delete('category')
                      })
                    }
                  />
                  <span>{category.name}</span>
                </label>
              )
            })}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Merchants</Label>
          <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
            {merchants.map((merchant) => {
              const checked = selectedMerchantId === merchant.id
              return (
                <label className="flex items-center gap-2 text-sm" key={merchant.id}>
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(value) =>
                      pushParams((params) => {
                        if (value === true) params.set('merchantId', merchant.id)
                        else if (checked) params.delete('merchantId')
                      })
                    }
                  />
                  <span>{merchant.storeName}</span>
                </label>
              )
            })}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Ratings</Label>
          {[4, 3, 2].map((rating) => (
            <button
              className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition hover:bg-[#f9f3ea] ${
                selectedMinRating === rating ? 'bg-[#f9f3ea] font-semibold text-[#7f5700]' : ''
              }`}
              key={rating}
              onClick={() =>
                pushParams((params) => {
                  if (selectedMinRating === rating) params.delete('minRating')
                  else params.set('minRating', String(rating))
                })
              }
              type="button"
            >
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  className={`h-3.5 w-3.5 ${
                    index < rating ? 'fill-[#e8a317] text-[#e8a317]' : 'text-[#d6c4ad]'
                  }`}
                  key={index}
                />
              ))}
              <span>&amp; Up</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="in-stock">In stock only</Label>
          <Switch
            checked={inStockOnly}
            id="in-stock"
            onCheckedChange={(checked) =>
              pushParams((params) => {
                if (checked) params.set('inStock', '1')
                else params.delete('inStock')
              })
            }
          />
        </div>

        <Button
          className="w-full bg-[#a83635] text-white hover:bg-[#881e20]"
          disabled={isPending}
          onClick={() => router.refresh()}
          type="button"
        >
          Apply Filters
        </Button>
        </div>
      </>
  )

  if (isSheet) {
    return <div className="rounded-xl bg-white p-4 shadow-sm">{body}</div>
  }

  return (
    <Card className="border-[#d6c4ad] bg-white shadow-sm">
      <CardContent className="space-y-0 p-6">{body}</CardContent>
    </Card>
  )
}
