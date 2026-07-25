'use client'

import Link from 'next/link'
import { LogOut, Pencil, ShieldCheck } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage, Badge, Button } from '@bharatmart/ui'

type AccountHeroProps = {
  name: string
  imageUrl: string | null
  emailVerified: boolean
}

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'BM'
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase()
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase()
}

export function AccountHero({ name, imageUrl, emailVerified }: AccountHeroProps) {
  const displayName = name.trim() || 'BharatMart customer'

  return (
    <section className="rounded-2xl border border-[#e8d9c8] bg-[#f9f3ea] p-6 shadow-sm md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4 sm:items-center sm:gap-5">
          <Avatar className="h-20 w-20 border-2 border-white shadow-sm md:h-24 md:w-24">
            {imageUrl ? <AvatarImage alt={displayName} src={imageUrl} /> : null}
            <AvatarFallback className="bg-[#efe2cf] font-heading text-2xl font-semibold text-[#7f5700] md:text-3xl">
              {initialsFromName(displayName)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 space-y-2">
            <h1 className="font-heading text-3xl font-semibold tracking-tight text-[#1e1b16] md:text-4xl">
              {displayName}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              {emailVerified ? (
                <Badge className="gap-1 bg-[#2e6a39] text-white hover:bg-[#2e6a39]">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
                  Verified Customer
                </Badge>
              ) : (
                <Badge className="bg-[#ffdeae] text-[#5b3d00] hover:bg-[#ffdeae]">
                  Email verification pending
                </Badge>
              )}
            </div>
            <p className="max-w-xl text-sm text-[#514534]">
              Manage your profile, orders and saved addresses.
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <Button
            asChild
            className="w-full bg-[#7f5700] text-white hover:bg-[#604100] sm:w-auto"
          >
            <Link
              aria-label="Edit profile details"
              href="#personal-information"
              onClick={() => {
                window.setTimeout(() => {
                  document
                    .getElementById('personal-information')
                    ?.querySelector<HTMLButtonElement>('button[aria-label="Edit personal information"]')
                    ?.click()
                }, 100)
              }}
            >
              <Pencil className="mr-2 h-4 w-4" aria-hidden />
              Edit Profile
            </Link>
          </Button>
          <Button
            aria-label="Log out of your account"
            className="w-full border-[#d6c4ad] text-[#a83635] hover:bg-[#ffdad6] hover:text-[#93000a] sm:w-auto"
            onClick={() => void signOut({ callbackUrl: '/' })}
            type="button"
            variant="outline"
          >
            <LogOut className="mr-2 h-4 w-4" aria-hidden />
            Logout
          </Button>
        </div>
      </div>
    </section>
  )
}
