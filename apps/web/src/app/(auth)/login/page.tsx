import { Suspense } from 'react'
import { CredentialsLoginForm } from '@/components/credentials-login-form'

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="p-8">Loading…</main>}>
      <CredentialsLoginForm
        title="Log in"
        subtitle="Sign in to your BharatMart UK customer account."
        defaultRedirect="/"
      />
    </Suspense>
  )
}
