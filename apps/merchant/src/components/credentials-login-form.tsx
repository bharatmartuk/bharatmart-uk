'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { safeInternalPath } from '@bharatmart/utils'
import { Button, Input, Label } from '@bharatmart/ui'
import { useGoogleAuthAvailable } from '@/hooks/use-google-auth-available'

type CredentialsLoginFormProps = {
  title: string
  subtitle: string
  defaultRedirect?: string
}

export function CredentialsLoginForm({
  title,
  subtitle,
  defaultRedirect = '/',
}: CredentialsLoginFormProps) {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? defaultRedirect
  const googleAvailable = useGoogleAuthAvailable()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    })

    setPending(false)

    if (result?.error) {
      setError('Invalid email or password, or this account is not allowed here.')
      return
    }

    // Hard navigation so middleware sees the new session cookie immediately.
    window.location.assign(safeInternalPath(callbackUrl, '/', result?.url))
  }

  async function onGoogleSignIn() {
    setError(null)
    setPending(true)
    try {
      // New sellers land on onboarding; existing merchants go to the dashboard.
      await signIn('google', { callbackUrl: '/register-business' })
    } catch {
      setPending(false)
      setError('Google sign-in could not be started. Please try again.')
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-16">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="rounded-lg border border-dashed bg-muted/40 p-3 text-xs text-muted-foreground">
        Demo merchant:{' '}
        <span className="font-medium text-foreground">merchant@bharatmart.test</span> /{' '}
        <span className="font-medium text-foreground">Password123!</span>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
      {googleAvailable ? (
        <>
          <div className="flex items-center gap-3" aria-hidden="true">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              or
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <Button
            className="w-full"
            disabled={pending}
            onClick={() => void onGoogleSignIn()}
            type="button"
            variant="outline"
          >
            <svg aria-hidden="true" className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.55h3.24c1.9-1.75 2.98-4.32 2.98-7.42Z"
                fill="#4285F4"
              />
              <path
                d="M12 22c2.7 0 4.98-.9 6.63-2.35l-3.24-2.55c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.63A10 10 0 0 0 12 22Z"
                fill="#34A853"
              />
              <path
                d="M6.39 13.93A6 6 0 0 1 6.08 12c0-.67.12-1.32.31-1.93V7.44H3.04A10 10 0 0 0 2 12c0 1.64.39 3.19 1.04 4.56l3.35-2.63Z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.44l3.35 2.63C7.18 7.7 9.39 5.94 12 5.94Z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </Button>
        </>
      ) : null}
      <p className="text-center text-sm text-muted-foreground">
        New seller?{' '}
        <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/register-business">
          Register your business
        </Link>
      </p>
    </main>
  )
}
