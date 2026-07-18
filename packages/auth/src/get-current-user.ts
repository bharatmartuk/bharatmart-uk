import './augmentations'
import type { Session } from 'next-auth'
import type { AuthUser } from './types'

type AuthFn = () => Promise<Session | null>

/**
 * Server-side helper: wraps an app's `auth()` and returns a typed user, or null.
 */
export async function getCurrentUser(auth: AuthFn): Promise<AuthUser | null> {
  const session = await auth()
  const user = session?.user

  if (!user?.id || !user.role) {
    return null
  }

  return {
    id: user.id,
    role: user.role,
    merchantId: user.merchantId ?? null,
  }
}
