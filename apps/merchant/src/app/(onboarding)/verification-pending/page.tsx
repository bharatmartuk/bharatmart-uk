import Link from 'next/link'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@bharatmart/ui'
import { MerchantService } from '@bharatmart/services'
import { getCurrentUser } from '@/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function VerificationPendingPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const merchant = await MerchantService.getByUserId(user.id)
  if (!merchant) redirect('/register-business')
  if (merchant.verificationStatus === 'APPROVED') redirect('/')

  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-16">
      <Card className="w-full border-[#d6c4ad]">
        <CardHeader>
          <CardTitle className="text-[#7f5700]">Verification pending</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-[#514534]">
          <p>
            Thanks for submitting <strong>{merchant.storeName}</strong>. Our ops team is reviewing
            your documents.
          </p>
          <p>
            Current status:{' '}
            <strong className="text-[#a83635]">{merchant.verificationStatus}</strong>
          </p>
          <Button asChild variant="outline">
            <Link href="/login">Back to login</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
