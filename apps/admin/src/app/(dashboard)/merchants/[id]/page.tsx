import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@bharatmart/ui'
import { MerchantService } from '@bharatmart/services'
import { VerificationDecisionPanel } from '@/components/merchants/VerificationDecisionPanel'

export const dynamic = 'force-dynamic'

export default async function MerchantVerificationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const merchant = await MerchantService.getById(id)
  if (!merchant) notFound()

  return (
    <main className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-semibold">{merchant.storeName}</h1>
          <p className="text-sm text-[#514534]">
            {merchant.businessName} · {merchant.user.email}
          </p>
          <Badge className="mt-2">{merchant.verificationStatus}</Badge>
        </div>

        <Card className="border-[#d6c4ad]">
          <CardHeader>
            <CardTitle>Verification documents</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {merchant.verificationDocumentUrls.length === 0 ? (
              <p className="text-sm text-[#514534]">No documents uploaded.</p>
            ) : (
              merchant.verificationDocumentUrls.map((url) => (
                <a
                  className="relative block aspect-video overflow-hidden rounded-lg border border-[#d6c4ad]"
                  href={url}
                  key={url}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Image alt="Verification document" className="object-cover" fill src={url} unoptimized />
                </a>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <VerificationDecisionPanel merchantId={merchant.id} />
    </main>
  )
}
