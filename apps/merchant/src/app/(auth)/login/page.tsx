import { Suspense } from 'react'
import { CredentialsLoginForm } from '@/components/credentials-login-form'

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="p-8">Loading…</main>}>
      <CredentialsLoginForm
        title="Merchant login"
        subtitle="Sign in as a merchant, or use Google to start seller registration."
        defaultRedirect="/"
      />
    </Suspense>
  )
}
