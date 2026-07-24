import { RegisterForm } from '@/components/auth/RegisterForm'

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; callbackUrl?: string }>
}) {
  const params = await searchParams
  return (
    <RegisterForm
      callbackUrl={params.callbackUrl || '/'}
      defaultEmail={params.email || ''}
    />
  )
}
