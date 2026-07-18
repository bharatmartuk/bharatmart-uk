import { Suspense } from 'react'
import { CredentialsLoginForm } from '@/components/credentials-login-form'

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="p-8">Loading…</main>}>
      <CredentialsLoginForm
        title="Admin login"
        subtitle="Sign in with an ADMIN account to access the platform console."
        defaultRedirect="/"
      />
    </Suspense>
  )
}
