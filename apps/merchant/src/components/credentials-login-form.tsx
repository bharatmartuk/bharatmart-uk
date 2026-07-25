'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { getSession, signIn, signOut } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { safeInternalPath } from '@bharatmart/utils'
import { Button, Input, Label } from '@bharatmart/ui'
import { useGoogleAuthAvailable } from '@/hooks/use-google-auth-available'
import { resendSellerVerificationAction } from '@/app/(onboarding)/register-actions'

type CredentialsLoginFormProps = {
  title: string
  subtitle: string
  defaultRedirect?: string
  /** Existing CUSTOMER session — stay on login; never auto-open registration. */
  isCustomerSession?: boolean
}

export function CredentialsLoginForm({
  title,
  subtitle,
  defaultRedirect = '/',
  isCustomerSession = false,
}: CredentialsLoginFormProps) {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? defaultRedirect
  const continueRegistration =
    isCustomerSession || searchParams.get('continueRegistration') === '1'
  const googleAvailable = useGoogleAuthAvailable()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [needsVerification, setNeedsVerification] = useState(false)
  const [resending, setResending] = useState(false)
  const [pending, setPending] = useState(false)

  async function routeAfterSignIn() {
    const session = await getSession()
    const role = session?.user?.role

    if (role === 'MERCHANT') {
      window.location.assign('/')
      return
    }

    if (role === 'CUSTOMER') {
      window.location.assign('/login?continueRegistration=1')
      return
    }

    window.location.assign(safeInternalPath(callbackUrl, '/', null))
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setNeedsVerification(false)
    setPending(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
      callbackUrl,
    })

    if (result?.error) {
      setPending(false)
      if (result.code === 'rate_limited') {
        setError('Too many login attempts. Please wait a few minutes and try again.')
      } else if (result.code === 'email_not_verified') {
        setNeedsVerification(true)
        setError(
          'Please verify your email before signing in. Check your inbox for the confirmation link.',
        )
      } else {
        setError('Invalid email or password, or this account is not allowed here.')
      }
      return
    }

    await routeAfterSignIn()
  }

  async function onResendVerification() {
    if (!email.trim()) {
      setError('Enter your email address first.')
      return
    }
    setResending(true)
    const result = await resendSellerVerificationAction(email)
    setResending(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setError(null)
    setNeedsVerification(true)
  }

  async function onGoogleSignIn() {
    setError(null)
    setPending(true)
    try {
      await signIn('google', { callbackUrl: '/login?continueRegistration=1' })
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

      {continueRegistration ? (
        <div className="space-y-3 rounded-xl border border-[#d6c4ad] bg-[#f9f3ea] p-4 text-sm text-[#514534]">
          <p>
            You&apos;re signed in, but your seller profile is not finished yet. Continue registration
            or sign out and use a merchant account.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild className="flex-1" type="button">
              <Link href="/register-business?intent=continue">Continue registration</Link>
            </Button>
            <Button
              className="flex-1"
              onClick={() => void signOut({ callbackUrl: '/login' })}
              type="button"
              variant="outline"
            >
              Sign out
            </Button>
          </div>
        </div>
      ) : null}

      {!isCustomerSession ? (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              autoComplete="email"
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              autoComplete="current-password"
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}

          {needsVerification ? (
            <Button
              className="w-full"
              disabled={resending}
              onClick={() => void onResendVerification()}
              type="button"
              variant="outline"
            >
              {resending ? 'Sending…' : 'Resend verification email'}
            </Button>
          ) : null}

          <Button className="w-full" disabled={pending} type="submit">
            {pending ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      ) : null}

      {!isCustomerSession && googleAvailable ? (
        <>
          <div aria-hidden="true" className="flex items-center gap-3">
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
            Continue with Google
          </Button>
        </>
      ) : null}

      {!isCustomerSession ? (
        <p className="text-center text-sm text-muted-foreground">
          New seller?{' '}
          <Link
            className="font-medium text-primary underline-offset-4 hover:underline"
            href="/register-business?intent=register"
          >
            Register your business
          </Link>
        </p>
      ) : null}
    </main>
  )
}
