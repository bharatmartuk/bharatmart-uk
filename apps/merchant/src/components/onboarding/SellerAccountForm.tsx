'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { registerSchema, type RegisterInput } from '@bharatmart/validation'
import { Button, Input, Label } from '@bharatmart/ui'
import { registerSellerAccountAction } from '@/app/(onboarding)/register-actions'

export function SellerAccountForm() {
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  })

  async function onSubmit(values: RegisterInput) {
    setError(null)
    const created = await registerSellerAccountAction(values)
    if (!created.ok) {
      setError(created.error)
      return
    }

    const result = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
      callbackUrl: '/register-business',
    })

    if (result?.error) {
      setError('Account created, but sign-in failed. Please log in.')
      return
    }

    window.location.assign('/register-business')
  }

  async function onGoogleSignUp() {
    setError(null)
    try {
      await signIn('google', { callbackUrl: '/register-business' })
    } catch {
      setError('Google sign-up could not be started. Please try again.')
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6 py-16">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Register your business</h1>
        <p className="text-sm text-muted-foreground">
          Create a seller account first, then we&apos;ll collect your business details for
          verification.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input autoComplete="name" id="name" {...register('name')} />
          {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input autoComplete="email" id="email" type="email" {...register('email')} />
          {errors.email ? <p className="text-sm text-destructive">{errors.email.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            autoComplete="new-password"
            id="password"
            type="password"
            {...register('password')}
          />
          {errors.password ? (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          ) : null}
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Creating account…' : 'Continue'}
        </Button>
      </form>

      <div className="flex items-center gap-3" aria-hidden="true">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          or
        </span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <Button
        className="w-full"
        onClick={() => void onGoogleSignUp()}
        type="button"
        variant="outline"
      >
        Continue with Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          className="font-medium text-primary underline-offset-4 hover:underline"
          href="/login?callbackUrl=/register-business"
        >
          Sign in
        </Link>
      </p>
    </main>
  )
}
