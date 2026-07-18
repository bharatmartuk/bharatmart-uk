import NextAuth from 'next-auth'
import { buildAuthConfig, getCurrentUser as getAuthUser } from '@bharatmart/auth'
import { UserRole } from '@bharatmart/types'

const nextAuth = NextAuth(buildAuthConfig([UserRole.ADMIN]))

export const handlers = nextAuth.handlers
export const auth = nextAuth.auth
export const signIn = nextAuth.signIn
export const signOut = nextAuth.signOut

export async function getCurrentUser() {
  return getAuthUser(auth)
}
