'use client'

import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@bharatmart/ui'
import { ProductFilters } from '@/components/product/ProductFilters'
import { ProductSortSelect } from '@/components/product/ProductSortSelect'

type MerchantOption = {
  id: string
  storeName: string
}

type CategoryOption = {
  id: string
  name: string
  slug: string
}

/**
 * Sticky toolbar: sort + filters on mobile; sort only on desktop
 * (desktop filters live in the sticky sidebar).
 */
export function ProductsToolbar({
  categories,
  merchants,
}: {
  categories: CategoryOption[]
  merchants: MerchantOption[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="sticky top-16 z-30 -mx-4 mb-5 border-b border-[#e8d9c8] bg-[#fff8f0] px-4 py-3 md:top-20 md:-mx-0 md:border-0 md:bg-transparent md:px-0 md:py-0">
      <div className="flex items-center gap-2 md:justify-end">
        <div className="min-w-0 flex-1 md:flex-none">
          <ProductSortSelect className="w-full md:w-auto" />
        </div>

        <Sheet onOpenChange={setOpen} open={open}>
          <SheetTrigger asChild>
            <Button
              aria-label="Open filters"
              className="h-10 shrink-0 border-[#d6c4ad] bg-white px-3 text-[#7f5700] hover:bg-[#f9f3ea] lg:hidden"
              type="button"
              variant="outline"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent
            className="flex max-h-[85vh] w-full flex-col gap-0 overflow-y-auto border-[#d6c4ad] bg-[#fff8f0] p-0 sm:max-w-md"
            side="bottom"
          >
            <SheetHeader className="sticky top-0 z-10 border-b border-[#d6c4ad] bg-[#fff8f0] px-5 py-4 text-left">
              <SheetTitle className="font-heading text-xl text-[#1e1b16]">Filters</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-8 pt-2">
              <ProductFilters categories={categories} merchants={merchants} variant="sheet" />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}
