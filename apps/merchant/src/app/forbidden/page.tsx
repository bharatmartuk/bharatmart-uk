'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Button } from '@bharatmart/ui'

export default function ForbiddenPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold">403 - Forbidden</h1>
      <p className="text-muted-foreground">
        This Google/email account is not a merchant yet. Sign in with a merchant account, or
        register as a seller to continue.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/register-business">Become a seller</Link>
        </Button>
        <Button
          onClick={() => void signOut({ callbackUrl: '/login' })}
          type="button"
          variant="outline"
        >
          Use a different account
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Demo merchant login: <strong>merchant@bharatmart.test</strong> /{' '}
        <strong>Password123!</strong>
      </p>
    </main>
  )
}
