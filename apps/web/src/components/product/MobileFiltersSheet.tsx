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

type MerchantOption = {
  id: string
  storeName: string
}

type CategoryOption = {
  id: string
  name: string
  slug: string
}

export function MobileFiltersSheet({
  categories,
  merchants,
}: {
  categories: CategoryOption[]
  merchants: MerchantOption[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden">
      <Sheet onOpenChange={setOpen} open={open}>
        <SheetTrigger asChild>
          <Button
            aria-label="Open filters"
            className="fixed bottom-24 left-4 z-40 h-12 rounded-full bg-[#7f5700] px-5 text-white shadow-lg hover:bg-[#604100]"
            type="button"
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
