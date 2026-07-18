'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@bharatmart/ui'

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'newest', label: 'Newest' },
] as const

export function ProductSortSelect() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const value = searchParams.get('sort') ?? 'relevance'

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-[#837561]">Sort by</span>
      <Select
        onValueChange={(next) => {
          const params = new URLSearchParams(searchParams.toString())
          if (next === 'relevance') params.delete('sort')
          else params.set('sort', next)
          params.delete('page')
          const query = params.toString()
          router.push(query ? `${pathname}?${query}` : pathname)
        }}
        value={value}
      >
        <SelectTrigger className="w-[190px] border-[#d6c4ad] bg-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
