'use client'

import Link from 'next/link'
import { Heart, LogOut, Package, UserCircle } from 'lucide-react'
import { signOut } from 'next-auth/react'
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@bharatmart/ui'

type HeaderAuthNavProps = {
  isSignedIn: boolean
  displayName?: string | null
}

export function HeaderAuthNav({ isSignedIn, displayName }: HeaderAuthNavProps) {
  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-1 md:gap-2">
        <Button
          asChild
          className="hidden text-[#7f5700] hover:bg-[#efe2cf] hover:text-[#604100] sm:inline-flex"
          size="sm"
          variant="ghost"
        >
          <Link href="/login">Sign in</Link>
        </Button>
        <Button
          asChild
          className="bg-[#7f5700] text-white hover:bg-[#604100]"
          size="sm"
        >
          <Link href="/register">Sign up</Link>
        </Button>
        <Button asChild className="sm:hidden" size="icon" title="Sign in" variant="ghost">
          <Link aria-label="Sign in" href="/login">
            <UserCircle className="h-5 w-5 text-[#7f5700]" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Account menu"
          className="text-[#7f5700] hover:bg-[#efe2cf]"
          size="icon"
          title="Your account"
          variant="ghost"
        >
          <UserCircle className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 border-[#d6c4ad] bg-[#fff8f0]">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-medium text-[#1e1b16]">
            {displayName?.trim() || 'Your account'}
          </p>
          <p className="text-xs text-[#837561]">Customer account</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#d6c4ad]" />
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-[#efe2cf]">
          <Link href="/account">
            <UserCircle className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-[#efe2cf]">
          <Link href="/wishlist">
            <Heart className="mr-2 h-4 w-4" />
            Favourites
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer focus:bg-[#efe2cf]">
          <Link href="/account/orders">
            <Package className="mr-2 h-4 w-4" />
            Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[#d6c4ad]" />
        <DropdownMenuItem
          className="cursor-pointer text-[#a83635] focus:bg-[#ffdad6] focus:text-[#93000a]"
          onSelect={() => {
            void signOut({ callbackUrl: '/' })
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
