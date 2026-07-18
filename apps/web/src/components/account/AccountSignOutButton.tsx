'use client'

import { LogOut } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Button } from '@bharatmart/ui'

export function AccountSignOutButton() {
  return (
    <Button
      className="border-[#d6c4ad] text-[#a83635] hover:bg-[#ffdad6] hover:text-[#93000a]"
      onClick={() => void signOut({ callbackUrl: '/' })}
      type="button"
      variant="outline"
    >
      <LogOut className="mr-2 h-4 w-4" />
      Log out
    </Button>
  )
}
