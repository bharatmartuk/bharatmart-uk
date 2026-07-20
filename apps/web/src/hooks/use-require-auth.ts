'use client'

import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { setPendingAction, type PendingAction } from '@/lib/pending-action'

export function useRequireAuth() {
  const { status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  function requireAuth(action: PendingAction, onAuthed: () => void) {
    if (status === 'authenticated') {
      onAuthed()
      return
    }

    setPendingAction(action)
    const callbackUrl = encodeURIComponent(pathname || '/')
    router.push(`/login?callbackUrl=${callbackUrl}`)
  }

  return {
    requireAuth,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
  }
}
