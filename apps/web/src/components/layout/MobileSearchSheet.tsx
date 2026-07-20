'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import {
  Button,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@bharatmart/ui'
import { HeaderSearch } from '@/components/layout/HeaderSearch'

export function MobileSearchSheet() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet onOpenChange={setOpen} open={open}>
      <SheetTrigger asChild>
        <Button aria-label="Search" className="md:hidden" size="icon" variant="ghost">
          <Search className="h-5 w-5 text-[#7f5700]" />
        </Button>
      </SheetTrigger>
      <SheetContent className="border-[#d6c4ad] bg-[#fff8f0] p-4" side="top">
        <SheetHeader className="mb-3 text-left">
          <SheetTitle className="font-heading text-lg text-[#7f5700]">Search</SheetTitle>
        </SheetHeader>
        <HeaderSearch autoFocus onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  )
}
