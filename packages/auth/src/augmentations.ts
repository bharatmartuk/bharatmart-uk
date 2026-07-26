import type { DefaultSession } from 'next-auth'
import type { UserRole } from '@bharatmart/types'

declare module 'next-auth' {
  interface User {
    role: UserRole
    merchantId?: string | null
  }

  interface Session {
    user: {
      id: string
      role: UserRole
      merchantId: string | null
    } & DefaultSession['user']
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    role?: UserRole
    merchantId?: string | null
    /** Set when the DB user no longer exists — middleware treats session as logged out. */
    invalid?: boolean
  }
}

export {}
