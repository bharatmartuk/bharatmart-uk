import NextAuth from 'next-auth'
import { buildAuthConfig, getCurrentUser as getAuthUser } from '@bharatmart/auth'
import { UserRole } from '@bharatmart/types'

// CUSTOMER is allowed so "Become a Seller" Google/email users can start onboarding.
const nextAuth = NextAuth(buildAuthConfig([UserRole.MERCHANT, UserRole.CUSTOMER]))

export const handlers = nextAuth.handlers
export const auth = nextAuth.auth
export const signIn = nextAuth.signIn
export const signOut = nextAuth.signOut

export async function getCurrentUser() {
  return getAuthUser(auth)
}
