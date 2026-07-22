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
 * Sort + mobile filters trigger. Parent page provides sticky positioning.
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
    <div className="flex items-end gap-2">
      <div className="min-w-0 flex-1 lg:flex-none">
        <ProductSortSelect className="w-full lg:w-auto" />
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
  )
}
