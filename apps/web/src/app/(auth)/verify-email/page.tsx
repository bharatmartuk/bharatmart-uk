import Link from 'next/link'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@bharatmart/ui'
import { verifyEmailAction } from '@/app/(auth)/actions'

export const dynamic = 'force-dynamic'

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return (
      <VerifyResult
        body="Open the link from your confirmation email, or request a new one from the sign-in page."
        ok={false}
        title="Missing verification link"
      />
    )
  }

  const result = await verifyEmailAction(token)

  if (!result.ok) {
    return <VerifyResult body={result.error} ok={false} title="Could not verify email" />
  }

  return (
    <VerifyResult
      body={
        result.alreadyVerified
          ? `${result.email} was already confirmed. You can sign in anytime.`
          : `${result.email} is confirmed. You can now sign in and receive order updates.`
      }
      ok
      title={result.alreadyVerified ? 'Already verified' : 'Email verified'}
    />
  )
}

function VerifyResult({
  title,
  body,
  ok,
}: {
  title: string
  body: string
  ok: boolean
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
      <Card className="border-[#d6c4ad] bg-[#fff8f0] shadow-sm">
        <CardHeader className="space-y-3">
          <Badge className={ok ? 'bg-[#2e6a39] text-white' : 'bg-[#ffdad6] text-[#93000a]'}>
            {ok ? 'Success' : 'Action needed'}
          </Badge>
          <CardTitle className="font-heading text-2xl text-[#7f5700]">{title}</CardTitle>
          <p className="text-sm text-[#514534]">{body}</p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild className="bg-[#7f5700] text-white hover:bg-[#604100]">
            <Link href="/login">Sign in</Link>
          </Button>
          {!ok ? (
            <Button asChild variant="outline">
              <Link href="/register">Create an account</Link>
            </Button>
          ) : (
            <Button asChild variant="outline">
              <Link href="/">Continue shopping</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
