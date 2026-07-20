'use client'

import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { Button } from '@bharatmart/ui'
import { WHATSAPP_URL } from '@/lib/contact'

export function WhatsAppFloat() {
  return (
    <aside className="fixed bottom-5 right-5 z-40">
      <Button
        asChild
        className="h-12 rounded-full bg-[#2e6a39] px-4 text-white shadow-lg hover:bg-[#135224]"
      >
        <a href={WHATSAPP_URL} rel="noreferrer" target="_blank">
          <MessageCircle className="mr-2 h-5 w-5" />
          <span className="hidden sm:inline">Chat on WhatsApp</span>
        </a>
      </Button>
    </aside>
  )
}
