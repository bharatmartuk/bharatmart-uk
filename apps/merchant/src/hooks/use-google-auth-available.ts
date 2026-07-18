'use client'

import { useEffect, useState } from 'react'

/** True when Auth.js has a Google provider configured on this deployment. */
export function useGoogleAuthAvailable() {
  const [available, setAvailable] = useState(false)

  useEffect(() => {
    let cancelled = false
    void fetch('/api/auth/providers')
      .then((res) => (res.ok ? res.json() : null))
      .then((providers: Record<string, unknown> | null) => {
        if (!cancelled) setAvailable(Boolean(providers?.google))
      })
      .catch(() => {
        if (!cancelled) setAvailable(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return available
}
