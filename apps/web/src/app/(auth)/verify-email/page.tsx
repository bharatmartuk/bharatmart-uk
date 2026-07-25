import Link from 'next/link'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@bharatmart/ui'
import { verifyEmailAction } from '@/app/(auth)/actions'
import { merchantAppPath } from '@/lib/app-urls'

export const dynamic = 'force-dynamic'

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; audience?: string }>
}) {
  const { token, audience } = await searchParams
  const isSeller = audience === 'seller'

  if (!token) {
    return (
      <VerifyResult
        body="Open the link from your confirmation email, or request a new one from the sign-in page."
        isSeller={isSeller}
        ok={false}
        title="Missing verification link"
      />
    )
  }

  const result = await verifyEmailAction(token)

  if (!result.ok) {
    return (
      <VerifyResult
        body={result.error}
        isSeller={isSeller}
        ok={false}
        title="Could not verify email"
      />
    )
  }

  return (
    <VerifyResult
      body={
        result.alreadyVerified
          ? `${result.email} was already confirmed. You can sign in anytime.`
          : isSeller
            ? `${result.email} is confirmed. Sign in on the merchant app to continue seller registration.`
            : `${result.email} is confirmed. You can now sign in and receive order updates.`
      }
      isSeller={isSeller}
      ok
      title={result.alreadyVerified ? 'Already verified' : 'Email verified'}
    />
  )
}

function VerifyResult({
  title,
  body,
  ok,
  isSeller,
}: {
  title: string
  body: string
  ok: boolean
  isSeller: boolean
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
          {isSeller ? (
            <Button asChild className="bg-[#7f5700] text-white hover:bg-[#604100]">
              <a href={merchantAppPath('/login')}>Sign in as seller</a>
            </Button>
          ) : (
            <Button asChild className="bg-[#7f5700] text-white hover:bg-[#604100]">
              <Link href="/login">Sign in</Link>
            </Button>
          )}
          {!ok ? (
            <Button asChild variant="outline">
              {isSeller ? (
                <a href={merchantAppPath('/login?intent=register')}>Back to seller registration</a>
              ) : (
                <Link href="/register">Create an account</Link>
              )}
            </Button>
          ) : isSeller ? (
            <Button asChild variant="outline">
              <a href={merchantAppPath('/login')}>Continue to merchant login</a>
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
