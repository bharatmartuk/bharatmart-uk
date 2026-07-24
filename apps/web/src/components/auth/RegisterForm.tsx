'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { registerSchema, type RegisterInput } from '@bharatmart/validation'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, toast } from '@bharatmart/ui'
import { registerCustomerAction } from '@/app/(auth)/actions'

export function RegisterForm({
  defaultEmail = '',
  callbackUrl = '/',
}: {
  defaultEmail?: string
  callbackUrl?: string
}) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: defaultEmail, password: '' },
  })

  async function onSubmit(values: RegisterInput) {
    setError(null)
    const created = await registerCustomerAction(values)
    if (!created.ok) {
      setError(created.error)
      toast.error(created.error)
      return
    }

    const result = await signIn('credentials', {
      email: values.email,
      password: values.password,
      redirect: false,
      callbackUrl,
    })

    if (result?.error) {
      const message = 'Account created, but sign-in failed. Please log in.'
      setError(message)
      toast.message('Account created', { description: 'Please sign in to continue.' })
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`)
      return
    }

    toast.success('Welcome to BharatMart', {
      description: 'Your account is ready — happy shopping.',
    })
    router.push(callbackUrl || '/')
    router.refresh()
  }

  async function onGoogleSignUp() {
    setError(null)
    try {
      await signIn('google', { callbackUrl: callbackUrl || '/' })
    } catch {
      const message = 'Google sign-up could not be started. Please try again.'
      setError(message)
      toast.error(message)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <Card className="border-[#d6c4ad] bg-[#fff8f0] shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-2xl text-[#7f5700]">Create your account</CardTitle>
          <p className="text-sm text-[#514534]">
            Join BharatMart UK to save addresses, track orders, and checkout faster.
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input autoComplete="name" id="name" {...register('name')} />
              {errors.name ? <p className="text-sm text-[#a83635]">{errors.name.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input autoComplete="email" id="email" type="email" {...register('email')} />
              {errors.email ? <p className="text-sm text-[#a83635]">{errors.email.message}</p> : null}
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
                <p className="text-sm text-[#a83635]">{errors.password.message}</p>
              ) : null}
            </div>
            {error ? <p className="text-sm text-[#a83635]">{error}</p> : null}
            <Button
              className="w-full bg-[#2e6a39] text-white hover:bg-[#135224]"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
          <div className="my-5 flex items-center gap-3" aria-hidden="true">
            <div className="h-px flex-1 bg-[#d6c4ad]" />
            <span className="text-xs font-medium uppercase tracking-wider text-[#837561]">or</span>
            <div className="h-px flex-1 bg-[#d6c4ad]" />
          </div>
          <Button
            className="w-full border-[#d6c4ad] bg-white text-[#1e1b16] hover:bg-[#f9f3ea]"
            onClick={() => void onGoogleSignUp()}
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
            Sign up with Google
          </Button>
          <p className="mt-4 text-center text-sm text-[#514534]">
            Already registered?{' '}
            <Link
              className="font-semibold text-[#a83635] hover:underline"
              href={`/login?callbackUrl=${encodeURIComponent(callbackUrl || '/')}`}
            >
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  )
}
