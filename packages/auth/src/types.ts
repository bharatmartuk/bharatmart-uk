import type { UserRole } from '@bharatmart/types'
import type { NextAuthConfig } from 'next-auth'

export type AuthUser = {
  id: string
  role: UserRole
  merchantId: string | null
}

/** Shared NextAuth config shape returned by `buildAuthConfig`. */
export type AuthOptions = NextAuthConfig

export type { UserRole }
